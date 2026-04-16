import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, Warning } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { PaymentMethodCard } from '@/components/checkout/PaymentMethodCard';
import { getEventById } from '@/services/eventsService';
import { appendTicketsFromCheckout, userHasOverlappingTicket } from '@/services/ticketsService';
import type { MockEvent } from '@/types/domain';
import type { MockTicket } from '@/types/domain';
import type { SelectedSeat } from '@/types/seating';
import {
  CARD_PAYMENT_METHODS,
  formatCardNumber,
  formatCvv,
  formatExpiry,
  type PaymentFormState,
  type PaymentProcessStage,
  simulatePaymentOutcome,
  validatePaymentForm,
} from '@/lib/paymentMock';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';

type Step = 1 | 2 | 3;
type CheckoutLocationState = {
  selectedSeats?: SelectedSeat[];
  selectedTicketTypeId?: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function CheckoutPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { pushNotification } = useNotifications();
  const locationState = (location.state as CheckoutLocationState | null) ?? {};
  const [event, setEvent] = useState<MockEvent | null | undefined>(undefined);
  const [step, setStep] = useState<Step>(1);
  const [ticketTypeId, setTicketTypeId] = useState<string>('');
  const [qtyInput, setQtyInput] = useState(1);
  const [overlapOpen, setOverlapOpen] = useState(false);
  const [overlapDismissed, setOverlapDismissed] = useState(false);
  const [success, setSuccess] = useState<{ ticketId: string; orderRef: string } | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payFailOpen, setPayFailOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>({
    method: 'visa',
    cardholder: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    saveCard: false,
  });
  const [paymentTouched, setPaymentTouched] = useState(false);
  const [paymentStage, setPaymentStage] = useState<PaymentProcessStage>('idle');
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null);
  const selectedSeats = useMemo(() => locationState.selectedSeats ?? [], [locationState.selectedSeats]);

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      return;
    }
    getEventById(eventId).then((e) => {
      setEvent(e);
      if (e?.ticketTypes[0]) {
        setTicketTypeId(locationState.selectedTicketTypeId ?? e.ticketTypes[0].id);
      }
    });
  }, [eventId, locationState.selectedTicketTypeId]);

  useEffect(() => {
    if (event?.layoutType === 'seated' && step === 1) {
      setStep(2);
    }
  }, [event, step]);

  const seatedTicketTypeId = selectedSeats[0]?.ticketTypeId;
  const effectiveTicketTypeId =
    event?.layoutType === 'seated' ? seatedTicketTypeId ?? ticketTypeId : ticketTypeId;
  const qty = event?.layoutType === 'seated' ? selectedSeats.length : qtyInput;

  const selectedType = event?.ticketTypes.find((t) => t.id === effectiveTicketTypeId);
  const unitPrice = selectedType?.price ?? 0;
  const subtotal = unitPrice * qty;
  const fees = Math.round(subtotal * 0.05);
  const total = subtotal + fees;
  const selectedMethodConfig = useMemo(
    () => CARD_PAYMENT_METHODS.find((method) => method.id === paymentForm.method) ?? CARD_PAYMENT_METHODS[0]!,
    [paymentForm.method]
  );
  const paymentValidation = useMemo(() => validatePaymentForm(paymentForm), [paymentForm]);
  const canSubmitPayment = paymentValidation.isValid && !payLoading;

  async function handlePay() {
    if (!event || !selectedType) return;
    setPaymentTouched(true);
    setPaymentErrorMessage(null);
    if (!paymentValidation.isValid) {
      return;
    }
    setPayLoading(true);
    const hasOverlap = await userHasOverlappingTicket(event.dateStart, event.dateEnd, event.id);
    if (hasOverlap && !overlapDismissed) {
      setOverlapOpen(true);
      setPayLoading(false);
      return;
    }
    await completePurchase();
  }

  async function completePurchase() {
    if (!event || !selectedType) return;
    setOverlapOpen(false);
    setPayLoading(true);
    setOverlapDismissed(true);
    setPaymentStage('authorizing');
    await sleep(900);

    const outcome = simulatePaymentOutcome(paymentForm);
    if (outcome.requires3ds) {
      setPaymentStage('three_ds');
      await sleep(850);
    }
    if (outcome.shouldDecline) {
      setPaymentStage('declined');
      setPaymentErrorMessage(outcome.declineReason);
      setPayLoading(false);
      setPayFailOpen(true);
      setPaymentStage('idle');
      return;
    }

    setPaymentStage('approved');
    await sleep(350);

    const orderRef = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const newTickets: MockTicket[] = [];
    const ticketCount = event.layoutType === 'seated' ? selectedSeats.length : qty;
    for (let i = 0; i < ticketCount; i++) {
      const id = `tix-${crypto.randomUUID()}`;
      newTickets.push({
        id,
        eventId: event.id,
        eventTitle: event.title,
        venue: event.venue,
        city: event.city,
        dateStart: event.dateStart,
        dateEnd: event.dateEnd,
        status: 'active',
        typeName: selectedType.name,
        seatLabel:
          event.layoutType === 'seated'
            ? selectedSeats[i]?.label ?? `Section TBD · seat ${i + 1} (demo)`
            : undefined,
        orderRef,
        qrPayload: `qr-${id}`,
        pricePaid: unitPrice,
        countsForOverlap: true,
      });
    }
    appendTicketsFromCheckout(newTickets);
    setSuccess({ ticketId: newTickets[0]!.id, orderRef });
    pushNotification({
      kind: 'order',
      title: 'Order confirmed',
      body: `${event.title} · ${orderRef} · ${qty} ticket${qty === 1 ? '' : 's'}`,
      href: `/my-tickets/${newTickets[0]!.id}`,
    });
    setPayLoading(false);
    setPaymentStage('idle');
  }

  function onPaymentFieldChange(
    field: keyof Pick<PaymentFormState, 'cardholder' | 'cardNumber' | 'expiry' | 'cvv'>,
    value: string
  ) {
    setPaymentForm((prev) => {
      if (field === 'cardNumber') return { ...prev, cardNumber: formatCardNumber(value, prev.method) };
      if (field === 'expiry') return { ...prev, expiry: formatExpiry(value) };
      if (field === 'cvv') return { ...prev, cvv: formatCvv(value) };
      return { ...prev, cardholder: value };
    });
  }

  if (event === undefined) {
    return <div className="px-6 py-24 text-center text-ink-40">Loading…</div>;
  }
  if (!event || event.ticketsLeft <= 0) {
    return <Navigate to={`/events/${eventId}`} replace />;
  }
  if (event.layoutType === 'seated' && selectedSeats.length < 1) {
    return <Navigate to={`/checkout/${event.id}/seats`} replace />;
  }

  return (
    <div className="bg-ink-5/40 pb-20 pt-10">
      <div className="mx-auto max-w-[720px] px-6">
        <Link to={`/events/${event.id}`} className="text-[13px] font-semibold text-coral hover:underline">
          ← Back to event
        </Link>
        <h1 className="mt-4 text-2xl font-extrabold text-ink">Checkout</h1>
        <p className="mt-1 text-[14px] text-ink-60">{event.title}</p>

        <div className="mt-6 space-y-3 rounded-2xl border border-ink-10 bg-white p-4 text-[13px] leading-relaxed text-ink-60 shadow-sm">
          <details className="group">
            <summary className="cursor-pointer font-bold text-ink">Refund policy (summary)</summary>
            <p className="mt-2">
              No change-of-mind refunds. Resale is via auction before event day. Refunds apply for cancellation,
              major organizer edits, or seat conflicts per{' '}
              <Link to="/terms" className="font-semibold text-coral underline">
                Terms
              </Link>
              .
            </p>
          </details>
          <details className="group">
            <summary className="cursor-pointer font-bold text-ink">Seat lock while paying</summary>
            <p className="mt-2">
              Seats are held while payment processes. If payment fails or times out, locks release for others. Production
              enforces timeouts server-side.
            </p>
          </details>
        </div>

        <ol className="mt-8 flex gap-2 text-[12px] font-bold">
          {([1, 2, 3] as const).map((s) => (
            <li
              key={s}
              className={cn(
                'rounded-full px-3 py-1',
                step >= s ? 'bg-ink text-white' : 'bg-ink-10 text-ink-40'
              )}
            >
              {s}. {s === 1 ? 'Tickets' : s === 2 ? 'Review' : 'Pay'}
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-2xl border border-ink-10 bg-white p-6 shadow-sm">
          {step === 1 && event.layoutType !== 'seated' && (
            <div className="space-y-6">
              <label className="block">
                <span className="text-[12px] font-semibold text-ink-60">Ticket type</span>
                <select
                  value={ticketTypeId}
                  onChange={(e) => setTicketTypeId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
                >
                  {event.ticketTypes.map((tt) => (
                    <option key={tt.id} value={tt.id} disabled={tt.remaining < 1}>
                      {tt.name} — {tt.price} SAR ({tt.remaining} left)
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[12px] font-semibold text-ink-60">Quantity</span>
                <input
                  type="number"
                  min={1}
                  max={Math.min(selectedType?.remaining ?? 1, 10)}
                  value={qty}
                  onChange={(e) => setQtyInput(Math.max(1, Number(e.target.value)))}
                  className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
                />
              </label>
              <Button variant="dark" size="md" className="w-full" onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-[14px] text-ink-60">
                {qty}× {selectedType?.name} @ {unitPrice} SAR
              </p>
              {event.layoutType === 'seated' && (
                <div className="rounded-xl border border-ink-10 bg-ink-5/50 p-3">
                  <p className="text-[12px] font-semibold text-ink">Selected seats</p>
                  <p className="mt-1 text-[12px] text-ink-60">
                    {selectedSeats.map((seat) => seat.label).join(', ')}
                  </p>
                </div>
              )}
              <div className="rounded-xl bg-ink-5/80 p-4 text-[14px]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">{subtotal} SAR</span>
                </div>
                <div className="mt-2 flex justify-between text-ink-60">
                  <span>Fees (demo 5%)</span>
                  <span className="font-mono">{fees} SAR</span>
                </div>
                <div className="mt-3 flex justify-between border-t border-ink-10 pt-3 font-bold">
                  <span>Total</span>
                  <span className="font-mono">{total} SAR</span>
                </div>
              </div>
              <p className="text-[12px] text-ink-40">
                Payment is simulated. Seat locking, race handling, and refunds are enforced server-side in production.
              </p>
              <div className="flex gap-3">
                {event.layoutType === 'seated' ? (
                  <Button
                    variant="outline"
                    size="md"
                    className="flex-1"
                    onClick={() =>
                      navigate(`/checkout/${event.id}/seats`, {
                        state: {
                          selectedSeats,
                          selectedTicketTypeId: selectedSeats[0]?.ticketTypeId ?? ticketTypeId,
                        } as CheckoutLocationState,
                      })
                    }
                  >
                    Back to seats
                  </Button>
                ) : (
                  <Button variant="outline" size="md" className="flex-1" onClick={() => setStep(1)}>
                    Back
                  </Button>
                )}
                <Button variant="dark" size="md" className="flex-1" onClick={() => setStep(3)}>
                  Continue to pay
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[14px] font-semibold text-ink">Payment gateway (mock)</p>
                <span className="rounded-full bg-ink-5 px-2.5 py-1 text-[11px] font-semibold text-ink-60">
                  Secure checkout
                </span>
              </div>
              <p className="text-[13px] text-ink-60">
                Choose a card network and enter payment details to simulate a real authorization flow.
              </p>

              <div className="grid gap-2 sm:grid-cols-3">
                {CARD_PAYMENT_METHODS.map((method) => (
                  <PaymentMethodCard
                    key={method.id}
                    id={method.id}
                    label={method.label}
                    helper={method.helper}
                    selected={paymentForm.method === method.id}
                    onSelect={(selectedMethod) => setPaymentForm((prev) => ({ ...prev, method: selectedMethod }))}
                  />
                ))}
              </div>

              <div className="rounded-xl border border-ink-10 bg-ink-5/50 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="text-[12px] font-semibold text-ink-60">Cardholder name</span>
                    <input
                      value={paymentForm.cardholder}
                      onChange={(e) => onPaymentFieldChange('cardholder', e.target.value)}
                      placeholder={selectedMethodConfig.cardholderPlaceholder}
                      className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
                    />
                    {paymentTouched && paymentValidation.errors.cardholder && (
                      <p className="mt-1 text-[11px] text-coral">{paymentValidation.errors.cardholder}</p>
                    )}
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-[12px] font-semibold text-ink-60">Card number</span>
                    <input
                      value={paymentForm.cardNumber}
                      onChange={(e) => onPaymentFieldChange('cardNumber', e.target.value)}
                      placeholder={selectedMethodConfig.numberPlaceholder}
                      inputMode="numeric"
                      className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] font-mono"
                    />
                    {paymentValidation.detectedMethod && (
                      <p className="mt-1 text-[11px] text-ink-40">
                        Detected network: {paymentValidation.detectedMethod.toUpperCase()}
                      </p>
                    )}
                    {paymentTouched && paymentValidation.errors.cardNumber && (
                      <p className="mt-1 text-[11px] text-coral">{paymentValidation.errors.cardNumber}</p>
                    )}
                  </label>
                  <label className="block">
                    <span className="text-[12px] font-semibold text-ink-60">Expiry</span>
                    <input
                      value={paymentForm.expiry}
                      onChange={(e) => onPaymentFieldChange('expiry', e.target.value)}
                      placeholder="MM/YY"
                      inputMode="numeric"
                      className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] font-mono"
                    />
                    {paymentTouched && paymentValidation.errors.expiry && (
                      <p className="mt-1 text-[11px] text-coral">{paymentValidation.errors.expiry}</p>
                    )}
                  </label>
                  <label className="block">
                    <span className="text-[12px] font-semibold text-ink-60">{selectedMethodConfig.cvvLabel}</span>
                    <input
                      value={paymentForm.cvv}
                      onChange={(e) => onPaymentFieldChange('cvv', e.target.value)}
                      placeholder={selectedMethodConfig.cvvPlaceholder}
                      inputMode="numeric"
                      className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] font-mono"
                    />
                    {paymentTouched && paymentValidation.errors.cvv && (
                      <p className="mt-1 text-[11px] text-coral">{paymentValidation.errors.cvv}</p>
                    )}
                  </label>
                </div>
                <label className="mt-3 inline-flex items-center gap-2 text-[12px] text-ink-60">
                  <input
                    type="checkbox"
                    checked={paymentForm.saveCard}
                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, saveCard: e.target.checked }))}
                    className="h-4 w-4 rounded border-ink-20"
                  />
                  Save card for future purchases (mock)
                </label>
              </div>

              {paymentStage !== 'idle' && (
                <p className="rounded-lg bg-ink-5 px-3 py-2 text-[12px] font-semibold text-ink-60">
                  {paymentStage === 'authorizing' && 'Authorizing card with gateway...'}
                  {paymentStage === 'three_ds' && 'Running 3-D Secure challenge (mock)...'}
                  {paymentStage === 'approved' && 'Payment approved. Finalizing tickets...'}
                  {paymentStage === 'declined' && 'Payment declined by issuer.'}
                </p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="outline" size="md" className="flex-1" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  variant="dark"
                  size="md"
                  className="flex-1"
                  loading={payLoading}
                  disabled={!canSubmitPayment}
                  onClick={handlePay}
                >
                  Pay {total} SAR
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {overlapOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
            role="dialog"
            aria-modal
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="max-w-md rounded-2xl bg-white p-6 shadow-card-lg"
            >
              <div className="flex items-start gap-3">
                <Warning size={28} weight="fill" className="shrink-0 text-amber" />
                <div>
                  <h2 className="text-lg font-extrabold text-ink">Scheduling overlap</h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-60">
                    You already hold tickets for another event that overlaps this time. MyTicket is not responsible for
                    scheduling conflicts from purchasing overlapping tickets. Overlapping-event purchases are
                    non-refundable per our{' '}
                    <Link to="/terms" className="font-semibold text-coral underline">
                      Terms of Service
                    </Link>
                    .
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
                <Button
                  variant="dark"
                  size="md"
                  className="w-full sm:flex-1"
                  onClick={() => void completePurchase()}
                >
                  Ignore &amp; continue
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="w-full sm:flex-1"
                  onClick={() => {
                    setOverlapOpen(false);
                    setPayLoading(false);
                  }}
                >
                  Go back
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              className="max-w-md overflow-hidden rounded-2xl bg-white shadow-card-lg"
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-lemon/90 via-mint/40 to-coral/30 px-6 py-10 text-center">
                {Array.from({ length: 18 }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="pointer-events-none absolute h-2 w-2 rounded-full bg-white/90 shadow-sm"
                    style={{ left: `${(i * 17) % 92}%`, top: `${(i * 23) % 85}%` }}
                    initial={{ opacity: 0, scale: 0, y: 0 }}
                    animate={{
                      opacity: [0, 1, 0.6],
                      scale: [0, 1, 0.6],
                      y: [0, -28 - (i % 5) * 8],
                    }}
                    transition={{ duration: 1.1, delay: 0.05 * i, ease: 'easeOut' }}
                  />
                ))}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md"
                >
                  <CheckCircle size={40} weight="fill" className="text-mint-dark" />
                </motion.div>
                <h2 className="mt-4 text-2xl font-extrabold text-ink">You&apos;re in!</h2>
                <p className="mt-2 text-[14px] text-ink-60">
                  {event.title} · {qty} ticket{qty === 1 ? '' : 's'} · {total} SAR paid
                </p>
                <p className="mt-1 text-[13px] text-ink-40">Order {success.orderRef}</p>
              </div>
              <div className="space-y-3 p-6">
                <Link
                  to={`/my-tickets/${success.ticketId}`}
                  className="flex h-12 w-full items-center justify-center rounded-full bg-ink text-[14px] font-semibold text-white hover:bg-ink-80"
                >
                  View my tickets
                </Link>
                <Link
                  to="/my-tickets"
                  className="block text-center text-[13px] font-semibold text-coral hover:underline"
                >
                  All tickets
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {payFailOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
            role="dialog"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md rounded-2xl bg-white p-6 shadow-card-lg"
            >
              <h2 className="text-lg font-extrabold text-ink">Payment didn&apos;t go through</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-60">
                {paymentErrorMessage ??
                  'Seat locks are released immediately. Any card hold is cleared. Return to payment and try again, or pick different seats.'}
              </p>
              <Button variant="dark" size="md" className="mt-6 w-full" onClick={() => setPayFailOpen(false)}>
                OK
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

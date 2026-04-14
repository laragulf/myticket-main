import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { CheckCircle, Warning } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { getEventById } from '@/services/eventsService';
import { appendTicketsFromCheckout, userHasOverlappingTicket } from '@/services/ticketsService';
import type { MockEvent } from '@/types/domain';
import type { MockTicket } from '@/types/domain';
import { cn } from '@/lib/utils';

type Step = 1 | 2 | 3;

export function CheckoutPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState<MockEvent | null | undefined>(undefined);
  const [step, setStep] = useState<Step>(1);
  const [ticketTypeId, setTicketTypeId] = useState<string>('');
  const [qty, setQty] = useState(1);
  const [seatNote, setSeatNote] = useState('');
  const [overlapOpen, setOverlapOpen] = useState(false);
  const [overlapDismissed, setOverlapDismissed] = useState(false);
  const [success, setSuccess] = useState<{ ticketId: string; orderRef: string } | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payFailOpen, setPayFailOpen] = useState(false);

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      return;
    }
    getEventById(eventId).then((e) => {
      setEvent(e);
      if (e?.ticketTypes[0]) setTicketTypeId(e.ticketTypes[0].id);
    });
  }, [eventId]);

  const selectedType = event?.ticketTypes.find((t) => t.id === ticketTypeId);
  const unitPrice = selectedType?.price ?? 0;
  const subtotal = unitPrice * qty;
  const fees = Math.round(subtotal * 0.05);
  const total = subtotal + fees;

  async function handlePay() {
    if (!event || !selectedType) return;
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
    await new Promise((r) => setTimeout(r, 900));

    const orderRef = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const newTickets: MockTicket[] = [];
    for (let i = 0; i < qty; i++) {
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
            ? seatNote || `Section TBD · seat ${i + 1} (demo)`
            : undefined,
        orderRef,
        qrPayload: `qr-${id}`,
        pricePaid: unitPrice,
        countsForOverlap: true,
      });
    }
    appendTicketsFromCheckout(newTickets);
    setSuccess({ ticketId: newTickets[0]!.id, orderRef });
    setPayLoading(false);
  }

  if (event === undefined) {
    return <div className="px-6 py-24 text-center text-ink-40">Loading…</div>;
  }
  if (!event || event.ticketsLeft <= 0) {
    return <Navigate to={`/events/${eventId}`} replace />;
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
          {step === 1 && (
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
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                  className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
                />
              </label>
              {event.layoutType === 'seated' && (
                <label className="block">
                  <span className="text-[12px] font-semibold text-ink-60">
                    Seat preferences (demo — full seat map connects to backend)
                  </span>
                  <input
                    value={seatNote}
                    onChange={(e) => setSeatNote(e.target.value)}
                    placeholder="e.g. Section A, aisle"
                    className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
                  />
                  <p className="mt-2 text-[11px] text-ink-40">
                    If two buyers pay for the same seat simultaneously, both transactions may be rejected and seats
                    released — try again (fairness-first).
                  </p>
                </label>
              )}
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
                <Button variant="outline" size="md" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button variant="dark" size="md" className="flex-1" onClick={() => setStep(3)}>
                  Continue to pay
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-[14px] font-semibold text-ink">Mock payment</p>
              <p className="text-[13px] text-ink-60">
                Card fields would appear here. Click Pay to complete your demo purchase.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="outline" size="md" className="flex-1" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  variant="dark"
                  size="md"
                  className="flex-1"
                  loading={payLoading}
                  onClick={handlePay}
                >
                  Pay {total} SAR
                </Button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPayLoading(false);
                  setPayFailOpen(true);
                }}
                className="w-full text-center text-[12px] font-semibold text-coral underline underline-offset-2"
              >
                Simulate payment failure
              </button>
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
              className="max-w-md overflow-hidden rounded-2xl bg-white shadow-card-lg"
            >
              <div className="bg-gradient-to-br from-lemon/90 via-mint/40 to-coral/30 px-6 py-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md"
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
                Seat locks are released immediately. Any card hold is cleared. Return to payment and try again, or pick
                different seats.
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

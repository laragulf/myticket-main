import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { DownloadSimple, Gift, Gavel, Star, Wallet } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import {
  cancelAuctionForTicket,
  getTicketById,
  giftTicketToEmail,
  listTicketForAuction,
} from '@/services/ticketsService';
import type { MockTicket } from '@/types/domain';
import { cn } from '@/lib/utils';

export function TicketDetailPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState<MockTicket | null | undefined>(undefined);
  const [giftOpen, setGiftOpen] = useState(false);
  const [auctionOpen, setAuctionOpen] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [giftDone, setGiftDone] = useState(false);

  const reload = useCallback(() => {
    if (!ticketId) return;
    getTicketById(ticketId).then(setTicket);
  }, [ticketId]);

  useEffect(() => {
    reload();
  }, [reload]);

  if (ticket === undefined) {
    return <div className="px-6 py-24 text-center text-ink-40">Loading…</div>;
  }
  if (!ticket) {
    return <Navigate to="/my-tickets" replace />;
  }

  const canGift =
    ticket.status === 'active' && !ticket.receivedAsGift && !ticket.fromAuction;
  const canAuction =
    ticket.status === 'active' && !ticket.receivedAsGift && !ticket.fromAuction;
  const canAct = ticket.status === 'active';

  function onConfirmGift(e: React.FormEvent) {
    e.preventDefault();
    if (!ticket) return;
    setError(null);
    if (!recipient.trim()) {
      setError('Enter an email or username.');
      return;
    }
    giftTicketToEmail(ticket.id, recipient.trim());
    setGiftDone(true);
    setGiftOpen(false);
    reload();
  }

  function onConfirmAuction(e: React.FormEvent) {
    e.preventDefault();
    if (!ticket) return;
    setError(null);
    const p = Number(listPrice);
    if (!Number.isFinite(p) || p <= 0 || p > ticket.pricePaid) {
      setError(`Price must be between 1 and ${ticket.pricePaid} SAR.`);
      return;
    }
    try {
      const endsAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      listTicketForAuction({ ticket: ticket, price: p, endsAt });
      setAuctionOpen(false);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not list');
    }
  }

  function onCancelListing() {
    if (!ticket || !ticket.listedAuctionId) return;
    cancelAuctionForTicket(ticket.id, ticket.listedAuctionId);
    reload();
  }

  return (
    <div className="bg-white pb-20 pt-10">
      <div className="mx-auto max-w-[720px] px-6">
        <Link to="/my-tickets" className="text-[13px] font-semibold text-coral hover:underline">
          ← My tickets
        </Link>

        <h1 className="mt-6 text-2xl font-extrabold text-ink">{ticket.eventTitle}</h1>
        <p className="mt-1 text-[14px] text-ink-60">
          {ticket.venue}, {ticket.city}
        </p>
        <p className="mt-1 text-[13px] text-ink-40">
          {new Date(ticket.dateStart).toLocaleString()} — {new Date(ticket.dateEnd).toLocaleString()}
        </p>

        {ticket.status === 'active' && (
          <div className="mt-6 rounded-xl border border-sky/40 bg-sky/10 px-4 py-3 text-[13px] text-ink-60">
            Reminders: typical sends at <strong className="text-ink">24h</strong> and{' '}
            <strong className="text-ink">1h</strong> before doors (channels configured by admin).
          </div>
        )}

        {giftDone && (
          <p className="mt-4 rounded-lg bg-mint/20 px-4 py-2 text-[13px] text-ink">
            Gift queued — recipient would receive email + PDF (demo).
          </p>
        )}

        <div className="mt-8 rounded-2xl border border-ink-10 bg-ink-5/40 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-40">Order / receipt</p>
          <p className="mt-1 font-mono text-lg font-bold text-ink">{ticket.orderRef}</p>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-ink-40">Ticket</p>
          <p className="mt-1 font-semibold text-ink">
            {ticket.typeName}
            {ticket.seatLabel ? ` · ${ticket.seatLabel}` : ''}
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-ink-10 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-40">Payment summary</p>
          <div className="mt-2 flex justify-between text-[14px]">
            <span className="text-ink-60">Ticket</span>
            <span className="font-mono font-semibold text-ink">{ticket.pricePaid} SAR</span>
          </div>
          <div className="mt-2 flex justify-between text-[12px] text-ink-40">
            <span>Fees (included in demo)</span>
            <span>—</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-ink-10 pt-3 text-[14px] font-bold">
            <span>Total paid</span>
            <span className="font-mono">{ticket.pricePaid} SAR</span>
          </div>
          <p className="mt-2 text-[12px] text-ink-40">Payment method: mock card (demo)</p>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="flex h-44 w-44 items-center justify-center rounded-2xl border-2 border-dashed border-ink-20 bg-white">
            <div className="text-center text-[11px] text-ink-40">
              QR preview
              <div
                className="mx-auto mt-2 h-24 w-24 bg-ink-5"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, #ccc 0, #ccc 2px, transparent 2px, transparent 6px)',
                }}
              />
            </div>
          </div>
        </div>

        {ticket.status === 'used' && (
          <div className="mt-8 rounded-2xl border border-lemon bg-lemon/15 p-6">
            <p className="font-extrabold text-ink">How was the event?</p>
            <p className="mt-2 text-[13px] text-ink-60">Star ratings only — one rating per event.</p>
            <Link
              to={`/events/${ticket.eventId}#rate`}
              className={cn(
                'mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-ink-80'
              )}
            >
              <Star size={18} weight="fill" className="text-lemon" />
              Rate this event
            </Link>
          </div>
        )}

        {ticket.status === 'auction' && ticket.listedAuctionId && (
          <div className="mt-8 rounded-xl border border-amber/50 bg-amber/10 p-4">
            <p className="text-[14px] font-semibold text-ink">Listed for resale</p>
            <p className="mt-1 text-[13px] text-ink-60">
              Your listing is visible in the auction area. You can cancel before it sells.
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={onCancelListing}>
              Cancel listing
            </Button>
          </div>
        )}

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          <Button variant="outline" size="md" icon={DownloadSimple} disabled={!canAct}>
            Download PDF
          </Button>
          <Button variant="outline" size="md" icon={Wallet} disabled={!canAct}>
            Add to Wallet
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={Gift}
            disabled={!canGift}
            onClick={() => {
              setError(null);
              setGiftOpen(true);
            }}
          >
            Gift ticket
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={Gavel}
            disabled={!canAuction}
            onClick={() => {
              setError(null);
              setListPrice(String(ticket.pricePaid));
              setAuctionOpen(true);
            }}
          >
            Drop to auction
          </Button>
        </div>
        {!canAct && ticket.status !== 'auction' && (
          <p className="mt-4 text-center text-[12px] text-ink-40">
            Primary actions apply to active tickets. Auction listings can be cancelled above.
          </p>
        )}
      </div>

      {giftOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" role="dialog">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-card-lg">
            <h2 className="text-lg font-extrabold text-ink">Gift ticket</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-60">
              Enter recipient email or MyTicket username. Gifts are free; no re-gift of gifted tickets; auction
              tickets cannot be gifted.
            </p>
            <form onSubmit={onConfirmGift} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-[12px] font-semibold text-ink-60">Email or username</span>
                <input
                  type="text"
                  required
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
                  placeholder="friend@example.com"
                />
              </label>
              {error && <p className="text-[13px] text-red-600">{error}</p>}
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setGiftOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="dark" className="flex-1">
                  Send gift
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {auctionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" role="dialog">
          <div className="max-w-md rounded-2xl bg-white p-6 shadow-card-lg">
            <h2 className="text-lg font-extrabold text-ink">List for auction</h2>
            <p className="mt-2 text-[13px] text-ink-60">
              Max price: {ticket.pricePaid} SAR (original or less). Listing ends in 48h (demo).
            </p>
            <form onSubmit={onConfirmAuction} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-[12px] font-semibold text-ink-60">Your price (SAR)</span>
                <input
                  type="number"
                  required
                  min={1}
                  max={ticket.pricePaid}
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 font-mono text-[14px]"
                />
              </label>
              {error && <p className="text-[13px] text-red-600">{error}</p>}
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setAuctionOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="dark" className="flex-1">
                  List ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

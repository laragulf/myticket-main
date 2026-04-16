import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Clock, MapPin } from '@phosphor-icons/react';
import { PLATFORM_AUCTION_COMMISSION_PCT } from '@/lib/constants';
import { getEventById } from '@/services/eventsService';
import { getListingsByEvent } from '@/services/auctionService';
import type { MockEvent } from '@/types/domain';

function formatRemaining(ms: number) {
  if (ms <= 0) return 'Ended';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  return `${m}m ${sec}s`;
}

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function AuctionEventPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState<MockEvent | null | undefined>(undefined);
  const now = useNow();

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      return;
    }
    getEventById(eventId).then(setEvent);
  }, [eventId]);

  const listings = useMemo(() => (eventId ? getListingsByEvent(eventId) : []), [eventId, now]);

  if (event === undefined) {
    return <div className="px-6 py-24 text-center text-ink-40">Loading…</div>;
  }
  if (!event) {
    return <Navigate to="/auction" replace />;
  }

  return (
    <div className="bg-ink-5/40 pb-20 pt-10">
      <div className="mx-auto max-w-[960px] px-6 lg:px-8">
        <Link to="/auction" className="text-[13px] font-semibold text-coral hover:underline">
          ← Auction
        </Link>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start">
          <img
            src={event.coverImage}
            alt=""
            className="aspect-video w-full max-w-md rounded-2xl object-cover sm:w-72"
          />
          <div>
            <h1 className="text-2xl font-extrabold text-ink">{event.title}</h1>
            <p className="mt-2 flex items-center gap-2 text-[14px] text-ink-60">
              <MapPin size={18} className="text-coral" weight="bold" />
              {event.venue}, {event.city}
            </p>
            <p className="mt-2 text-[13px] text-ink-40">
              {listings.length} resale listing{listings.length === 1 ? '' : 's'} · original price or less ·{' '}
              {PLATFORM_AUCTION_COMMISSION_PCT}% platform commission on successful sales (demo)
            </p>
            <Link
              to={`/events/${event.id}`}
              className="mt-4 inline-block text-[13px] font-bold text-coral hover:underline"
            >
              View event details
            </Link>
          </div>
        </div>

        <ul className="mt-10 space-y-4">
          {listings.map((l) => {
            const ms = new Date(l.endsAt).getTime() - now;
            return (
              <li
                key={l.id}
                className="rounded-2xl border border-ink-10 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-lg font-bold text-ink">{l.price} SAR</p>
                    <p className="text-[12px] text-ink-40">was {l.originalPrice} SAR max allowed</p>
                    {l.seatLabel && (
                      <p className="mt-2 text-[13px] font-medium text-ink-60">{l.seatLabel}</p>
                    )}
                    <p className="mt-1 text-[12px] text-ink-40">Seller: {l.sellerLabel}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                    <Clock size={18} className="text-coral" />
                    {formatRemaining(ms)}
                  </div>
                </div>
                <p className="mt-4 text-[12px] text-ink-40">
                  Purchase flow connects to payment; QR transfers to buyer on success (demo).
                </p>
              </li>
            );
          })}
        </ul>

        {listings.length === 0 && (
          <p className="mt-8 text-center text-[15px] text-ink-40">No listings for this event.</p>
        )}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock } from '@phosphor-icons/react';
import { MOCK_EVENTS } from '@/data/mockEvents';
import { PLATFORM_AUCTION_COMMISSION_PCT } from '@/lib/constants';
import { countListingsByEvent, getAllListings, nearestEndForEvent } from '@/services/auctionService';

function formatRemaining(ms: number) {
  if (ms <= 0) return 'Ended';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function AuctionPage() {
  const now = useNow();
  const listings = useMemo(() => getAllListings(), [now]);
  const counts = useMemo(() => countListingsByEvent(), [listings.length, now]);

  const eventIds = useMemo(() => {
    const ids = new Set<string>();
    for (const l of listings) ids.add(l.eventId);
    return [...ids];
  }, [listings]);

  const events = useMemo(() => {
    return MOCK_EVENTS.filter((e) => eventIds.includes(e.id)).sort((a, b) => {
      const na = nearestEndForEvent(a.id) ?? '';
      const nb = nearestEndForEvent(b.id) ?? '';
      return new Date(na).getTime() - new Date(nb).getTime();
    });
  }, [eventIds, listings, now]);

  return (
    <div className="bg-ink-5/40 pb-20 pt-10">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-40">Resale</span>
        <h1 className="mt-2 text-[36px] font-extrabold tracking-tight text-ink">Auction</h1>
        <p className="mt-3 max-w-2xl text-[15px] text-ink-60">
          Tickets at original price or less. Countdowns reset when listings end. Platform commission on successful
          resale: <strong className="text-ink">{PLATFORM_AUCTION_COMMISSION_PCT}%</strong> (mock; configurable by admin
          in production).
        </p>

        <p className="mt-4 text-[13px] text-ink-40">
          {listings.length} active listing{listings.length === 1 ? '' : 's'} across {events.length} event
          {events.length === 1 ? '' : 's'}.
        </p>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => {
            const n = counts[e.id] ?? 0;
            const end = nearestEndForEvent(e.id);
            const ms = end ? new Date(end).getTime() - now : 0;
            return (
              <article
                key={e.id}
                className="overflow-hidden rounded-2xl border border-ink-10 bg-white shadow-sm transition-shadow hover:shadow-card-md"
              >
                <Link to={`/auction/events/${e.id}`} className="block aspect-[16/10] bg-ink-10">
                  <img src={e.coverImage} alt="" className="h-full w-full object-cover" />
                </Link>
                <div className="p-4">
                  <h2 className="font-extrabold text-ink">
                    <Link to={`/auction/events/${e.id}`} className="hover:text-coral">
                      {e.title}
                    </Link>
                  </h2>
                  <p className="mt-2 flex items-center gap-2 text-[12px] font-medium text-ink-60">
                    <Clock size={16} className="text-coral" />
                    {n} resale ticket{n === 1 ? '' : 's'} · nearest ends{' '}
                    <span className="font-mono font-bold text-ink">{end ? formatRemaining(ms) : '—'}</span>
                  </p>
                  <p className="mt-2 text-[13px] text-ink-40">{e.city}</p>
                  <Link
                    to={`/auction/events/${e.id}`}
                    className="mt-4 inline-block text-[13px] font-bold text-coral hover:underline"
                  >
                    View listings →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {events.length === 0 && (
          <p className="mt-12 text-center text-[15px] text-ink-40">No active resale listings right now.</p>
        )}
      </div>
    </div>
  );
}

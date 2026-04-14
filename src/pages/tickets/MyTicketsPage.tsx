import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyTickets } from '@/services/ticketsService';
import type { MockTicket, TicketStatus } from '@/types/domain';
import { cn } from '@/lib/utils';

const STATUS_LABEL: Record<TicketStatus, string> = {
  active: 'Active',
  auction: 'In auction',
  gifted: 'Gifted',
  used: 'Used',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

export function MyTicketsPage() {
  const [tickets, setTickets] = useState<MockTicket[]>([]);
  const [filter, setFilter] = useState<TicketStatus | 'all'>('all');

  useEffect(() => {
    getMyTickets().then(setTickets);
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return tickets;
    return tickets.filter((t) => t.status === filter);
  }, [tickets, filter]);

  return (
    <div className="bg-white pb-20 pt-10">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <h1 className="text-[32px] font-extrabold tracking-tight text-ink">My tickets</h1>
        <p className="mt-2 max-w-xl text-[15px] text-ink-60">
          View, download, gift, or list tickets. Full QR and wallet integration connects when your backend is live.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {(['all', 'active', 'auction', 'gifted', 'used', 'expired', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={cn(
                'rounded-full px-4 py-2 text-[12px] font-bold transition-colors',
                filter === s ? 'bg-ink text-white' : 'bg-ink-5 text-ink-60 hover:bg-ink-10'
              )}
            >
              {s === 'all' ? 'All' : STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        <ul className="mt-10 space-y-4">
          {filtered.map((t) => (
            <li key={t.id}>
              <Link
                to={`/my-tickets/${t.id}`}
                className="flex flex-col gap-3 rounded-2xl border border-ink-10 bg-ink-5/30 p-5 transition-colors hover:border-coral sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-extrabold text-ink">{t.eventTitle}</p>
                  <p className="mt-1 text-[13px] text-ink-60">
                    {t.city} · {new Date(t.dateStart).toLocaleString()}
                  </p>
                  <p className="mt-1 text-[12px] text-ink-40">
                    {t.typeName}
                    {t.seatLabel ? ` · ${t.seatLabel}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide',
                      t.status === 'active' && 'bg-mint/40 text-ink',
                      t.status === 'auction' && 'bg-amber/30 text-ink',
                      t.status === 'gifted' && 'bg-sky/40 text-ink',
                      t.status === 'used' && 'bg-ink-10 text-ink-60',
                      t.status === 'expired' && 'bg-ink-10 text-ink-40',
                      t.status === 'cancelled' && 'bg-red-100 text-red-800'
                    )}
                  >
                    {STATUS_LABEL[t.status]}
                  </span>
                  <span className="text-[13px] font-semibold text-coral">View →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-[15px] text-ink-40">
            No tickets in this view.{' '}
            <Link to="/events" className="font-semibold text-coral hover:underline">
              Browse events
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import {
  getEngagements,
  getEngagementById,
  setEngagementStatus,
} from '@/services/engagementsService';
import type { MockEngagement } from '@/types/domain';
import { cn } from '@/lib/utils';

export function EngagementsPage() {
  const [list, setList] = useState<MockEngagement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setList(getEngagements());
  }, []);

  const selected = selectedId ? getEngagementById(selectedId) : undefined;

  function refresh() {
    setList(getEngagements());
  }

  function onAccept(id: string) {
    setEngagementStatus(id, 'accepted');
    refresh();
  }

  function onDecline(id: string) {
    setEngagementStatus(id, 'declined');
    refresh();
  }

  return (
    <div className="bg-white pb-20 pt-10">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <Link to="/marketplace" className="text-[13px] font-semibold text-coral hover:underline">
          ← Marketplace
        </Link>
        <h1 className="mt-4 text-[32px] font-extrabold text-ink">Engagements</h1>
        <p className="mt-2 max-w-2xl text-[15px] text-ink-60">
          Organizers may start chats from the organizer dashboard. Negotiation is in real-time chat in the full
          product. MyTicket does not process payments between parties.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
          <ul className="space-y-2">
            {list.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(e.id)}
                  className={cn(
                    'w-full rounded-xl border px-4 py-3 text-left transition-colors',
                    selectedId === e.id ? 'border-coral bg-coral/5' : 'border-ink-10 hover:border-ink-20'
                  )}
                >
                  <p className="font-bold text-ink">{e.organizerName}</p>
                  <p className="mt-1 line-clamp-2 text-[12px] text-ink-60">{e.topic}</p>
                  <p className="mt-2 text-[11px] font-semibold uppercase text-ink-40">{e.status}</p>
                </button>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border border-ink-10 bg-ink-5/30 p-6">
            {selected ? (
              <>
                <h2 className="text-xl font-extrabold text-ink">{selected.topic}</h2>
                <p className="mt-1 text-[13px] text-ink-40">
                  From {selected.organizerName} · {new Date(selected.createdAt).toLocaleString()}
                </p>
                <p className="mt-6 text-[14px] leading-relaxed text-ink-60">{selected.preview}</p>
                <div className="mt-4 rounded-lg bg-white p-4 text-[13px] text-ink-40">
                  Chat transcript placeholder — WebSocket thread in production.
                </div>
                {selected.status === 'pending' && (
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button variant="dark" size="md" onClick={() => onAccept(selected.id)}>
                      Accept
                    </Button>
                    <Button variant="outline" size="md" onClick={() => onDecline(selected.id)}>
                      Decline
                    </Button>
                  </div>
                )}
                {selected.status === 'accepted' && (
                  <p className="mt-6 text-[13px] font-semibold text-mint-dark">You accepted — availability set to Reserved (demo).</p>
                )}
                {selected.status === 'declined' && (
                  <p className="mt-6 text-[13px] text-ink-60">Declined — organizer notified (demo).</p>
                )}
              </>
            ) : (
              <p className="text-[14px] text-ink-40">Select a conversation.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDots, CheckCircle, ClockCounterClockwise, UserCircle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import {
  addEngagementMessage,
  getEngagements,
  getEngagementById,
  setEngagementStatus,
  getTalentAvailability,
  setTalentAvailability,
} from '@/services/engagementsService';
import type { MockEngagement } from '@/types/domain';
import { cn } from '@/lib/utils';
import { canBrowseMarketplace } from '@/lib/marketplaceAccess';

export function EngagementsPage() {
  const { user } = useAuth();
  const [list, setList] = useState<MockEngagement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [availability, setAvailability] = useState(getTalentAvailability());
  const talentReady = user?.role === 'talent' && user?.talentApplicationStatus === 'approved';

  useEffect(() => {
    setList(getEngagements());
    setAvailability(getTalentAvailability());
  }, []);

  const selected = selectedId ? getEngagementById(selectedId) : undefined;
  const statusCounts = useMemo(
    () => ({
      pending: list.filter((x) => x.status === 'pending').length,
      accepted: list.filter((x) => x.status === 'accepted').length,
      declined: list.filter((x) => x.status === 'declined').length,
    }),
    [list]
  );

  function refresh() {
    setList(getEngagements());
  }

  function onAccept(id: string) {
    setEngagementStatus(id, 'accepted');
    setAvailability(getTalentAvailability());
    refresh();
  }

  function onDecline(id: string) {
    setEngagementStatus(id, 'declined');
    refresh();
  }

  function onSendMessage() {
    if (!selected) return;
    addEngagementMessage(selected.id, 'talent', message);
    setMessage('');
    refresh();
  }

  return (
    <div className="bg-ink-5/40 pb-20 pt-10">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <Link
          to={canBrowseMarketplace(user) ? '/marketplace' : '/'}
          className="text-[13px] font-semibold text-coral hover:underline"
        >
          ← {canBrowseMarketplace(user) ? 'Marketplace' : 'Home'}
        </Link>

        <div className="mt-4 rounded-3xl border border-ink-10 bg-white p-6 md:p-8">
          <h1 className="text-[32px] font-extrabold text-ink">Engagements</h1>
          <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-ink-60">
            Organizers may start chats from organizer tooling. Negotiation is in-thread (mock). MyTicket does not
            process off-platform payments between parties.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-ink-10 bg-ink-5/50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-40">Pending</p>
              <p className="mt-1 text-xl font-extrabold text-ink">{statusCounts.pending}</p>
            </div>
            <div className="rounded-xl border border-ink-10 bg-mint/20 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-40">Accepted</p>
              <p className="mt-1 text-xl font-extrabold text-ink">{statusCounts.accepted}</p>
            </div>
            <div className="rounded-xl border border-ink-10 bg-coral/10 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-40">Declined</p>
              <p className="mt-1 text-xl font-extrabold text-ink">{statusCounts.declined}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-ink-10 bg-ink-5/40 px-3 py-2">
            <span className="text-[12px] font-semibold text-ink-60">Availability status</span>
            <button
              type="button"
              onClick={() => {
                setTalentAvailability('available');
                setAvailability('available');
              }}
              className={cn(
                'rounded-full px-3 py-1.5 text-[12px] font-semibold',
                availability === 'available' ? 'bg-mint text-ink' : 'bg-white text-ink-40'
              )}
            >
              Available
            </button>
            <button
              type="button"
              onClick={() => {
                setTalentAvailability('reserved');
                setAvailability('reserved');
              }}
              className={cn(
                'rounded-full px-3 py-1.5 text-[12px] font-semibold',
                availability === 'reserved' ? 'bg-ink text-white' : 'bg-white text-ink-40'
              )}
            >
              Reserved
            </button>
          </div>

          {!talentReady && (
            <div className="mt-4 rounded-xl border border-lemon bg-lemon/15 p-4 text-[13px] text-ink-60">
              <p className="font-semibold text-ink">Talent approval required for engagement actions.</p>
              <p className="mt-1">
                Go to{' '}
                <Link to="/profile" className="font-semibold text-coral hover:underline">
                  Account
                </Link>{' '}
                and complete Talent onboarding first.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
          <aside className="rounded-2xl border border-ink-10 bg-white p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-40">Conversations</p>
              <span className="rounded-full bg-ink-5 px-2.5 py-1 text-[11px] font-semibold text-ink-60">
                {list.length} total
              </span>
            </div>
            <ul className="space-y-2">
              {list.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(e.id)}
                    className={cn(
                      'w-full rounded-xl border p-3 text-left transition-colors',
                      selectedId === e.id ? 'border-coral bg-coral/5' : 'border-ink-10 hover:border-ink-20'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-ink">{e.organizerName}</p>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
                          e.status === 'pending' && 'bg-ink-5 text-ink-60',
                          e.status === 'accepted' && 'bg-mint/30 text-mint-dark',
                          e.status === 'declined' && 'bg-coral/15 text-coral'
                        )}
                      >
                        {e.status}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[12px] text-ink-60">{e.topic}</p>
                    <p className="mt-2 text-[11px] text-ink-40">{new Date(e.createdAt).toLocaleDateString()}</p>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className="rounded-2xl border border-ink-10 bg-white p-5 md:p-6">
            {selected ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold text-ink">{selected.topic}</h2>
                    <p className="mt-1 text-[13px] text-ink-40">
                      From {selected.organizerName} · {new Date(selected.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-[11px] font-semibold uppercase',
                      selected.status === 'pending' && 'bg-ink-5 text-ink-60',
                      selected.status === 'accepted' && 'bg-mint/30 text-mint-dark',
                      selected.status === 'declined' && 'bg-coral/15 text-coral'
                    )}
                  >
                    {selected.status}
                  </span>
                </div>

                <p className="mt-4 rounded-xl border border-ink-10 bg-ink-5/50 px-4 py-3 text-[14px] leading-relaxed text-ink-60">
                  {selected.preview}
                </p>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_280px]">
                  <div className="rounded-xl border border-ink-10 bg-ink-5/30 p-4">
                    <p className="text-[12px] font-semibold text-ink-60">Negotiation thread</p>
                    <ul className="mt-3 max-h-[280px] space-y-2 overflow-y-auto pr-1">
                      {selected.messages.map((msg) => (
                        <li
                          key={msg.id}
                          className={cn(
                            'rounded-xl px-3 py-2 text-[12px]',
                            msg.sender === 'talent'
                              ? 'ml-8 bg-ink text-white'
                              : 'mr-8 border border-ink-10 bg-white text-ink-60'
                          )}
                        >
                          <p>{msg.text}</p>
                          <p className={cn('mt-1 text-[10px]', msg.sender === 'talent' ? 'text-white/70' : 'text-ink-40')}>
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex gap-2">
                      <input
                        value={message}
                        disabled={!talentReady}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={talentReady ? 'Reply with pricing, terms, or schedule...' : 'Talent approval required'}
                        className="w-full rounded-xl border border-ink-10 bg-white px-4 py-2.5 text-[13px]"
                      />
                      <Button variant="dark" size="md" disabled={!talentReady || message.trim().length < 1} onClick={onSendMessage}>
                        Send
                      </Button>
                    </div>
                  </div>

                  <aside className="space-y-3">
                    <div className="rounded-xl border border-ink-10 bg-ink-5/30 p-4">
                      <p className="text-[12px] font-semibold text-ink-60">Organizer profile</p>
                      <p className="mt-2 flex items-center gap-2 font-bold text-ink">
                        <UserCircle size={18} weight="duotone" className="text-coral" />
                        {selected.organizerProfile.name}
                      </p>
                      <p className="mt-1 text-[12px] text-ink-40">
                        {selected.organizerProfile.organizerType} · {selected.organizerProfile.city}
                      </p>
                      <p className="mt-2 text-[12px] leading-relaxed text-ink-60">{selected.organizerProfile.bio}</p>
                    </div>
                    <div className="rounded-xl border border-ink-10 bg-ink-5/30 p-4">
                      <p className="text-[12px] font-semibold text-ink-60">Recent events</p>
                      <ul className="mt-2 space-y-1 text-[12px] text-ink-60">
                        {selected.organizerProfile.recentEvents.map((ev) => (
                          <li key={ev} className="flex items-center gap-1.5">
                            <CalendarDots size={14} weight="fill" className="text-ink-40" />
                            {ev}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </aside>
                </div>

                {selected.status === 'pending' && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button variant="dark" size="md" onClick={() => onAccept(selected.id)} disabled={!talentReady}>
                      Accept
                    </Button>
                    <Button variant="outline" size="md" onClick={() => onDecline(selected.id)} disabled={!talentReady}>
                      Decline
                    </Button>
                  </div>
                )}
                {selected.status === 'accepted' && (
                  <p className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold text-mint-dark">
                    <CheckCircle size={16} weight="fill" />
                    You accepted — availability set to Reserved (demo). You can still manually change availability
                    above.
                  </p>
                )}
                {selected.status === 'declined' && (
                  <p className="mt-6 inline-flex items-center gap-2 text-[13px] text-ink-60">
                    <ClockCounterClockwise size={16} weight="fill" className="text-ink-40" />
                    Declined — organizer notified (demo).
                  </p>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-ink-20 bg-ink-5/40 px-4 py-12 text-center text-[14px] text-ink-40">
                Select a conversation to view the full engagement thread.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

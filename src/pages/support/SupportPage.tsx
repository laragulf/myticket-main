import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import type { SupportCategory } from '@/types/domain';

const CATEGORIES: { value: SupportCategory; label: string }[] = [
  { value: 'technical', label: 'Technical / app issue' },
  { value: 'ticket', label: 'Ticket / booking' },
  { value: 'dispute_organizer', label: 'Dispute with organizer' },
  { value: 'account', label: 'Account / profile' },
  { value: 'other', label: 'Other' },
];

export function SupportPage() {
  const { user } = useAuth();
  const [category, setCategory] = useState<SupportCategory>('ticket');
  const [subject, setSubject] = useState('');
  const [orderRef, setOrderRef] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="bg-white pb-20 pt-10">
      <div className="mx-auto max-w-[720px] px-6 lg:px-8">
        <h1 className="text-[32px] font-extrabold text-ink">Support</h1>
        <p className="mt-2 text-[15px] text-ink-60">
          Live chat is for signed-in users. Submit a case for the admin dashboard — including disputes with an
          organizer or complaints about an event.
        </p>

        <div className="mt-10 rounded-2xl border border-ink-10 bg-ink-5/40 p-6">
          <h2 className="text-lg font-extrabold text-ink">Live chat</h2>
          {user ? (
            <p className="mt-2 text-[14px] text-ink-60">
              Chat UI (WebSocket) plugs in here. Signed in as {user.email}.
            </p>
          ) : (
            <p className="mt-2 text-[14px] text-ink-60">
              <Link to="/login" className="font-semibold text-coral hover:underline">
                Sign in
              </Link>{' '}
              for real-time chat (events, tickets, disputes, bugs).
            </p>
          )}
          <Button variant="outline" size="md" className="mt-4" disabled={!user}>
            Open chat (demo)
          </Button>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-extrabold text-ink">Offline / ticketed request</h2>
          <p className="mt-2 text-[14px] text-ink-60">
            Each message is routed to the admin support dashboard. You&apos;ll get a notification when it&apos;s reviewed
            or resolved.
          </p>
          {sent ? (
            <p className="mt-6 rounded-xl bg-mint/20 p-4 text-[14px] text-ink">
              Request received. Reference your subject line for follow-up (demo — no server).
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-[12px] font-semibold text-ink-60">Category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SupportCategory)}
                  className="mt-1.5 w-full rounded-xl border border-ink-10 bg-white px-4 py-3 text-[14px] outline-none focus:border-coral"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[12px] font-semibold text-ink-60">Subject</span>
                <input
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral"
                  placeholder="Short summary"
                />
              </label>
              <label className="block">
                <span className="text-[12px] font-semibold text-ink-60">Order / ticket ref (optional)</span>
                <input
                  value={orderRef}
                  onChange={(e) => setOrderRef(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 font-mono text-[13px] outline-none focus:border-coral"
                  placeholder="ORD-…"
                />
              </label>
              <label className="block">
                <span className="text-[12px] font-semibold text-ink-60">Message</span>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral"
                  placeholder="Describe the issue. For organizer disputes, include event name and what happened."
                />
              </label>
              <Button type="submit" variant="dark" size="md">
                Submit
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import type { SupportCategory } from '@/types/domain';

const CATEGORIES: { value: SupportCategory; label: string }[] = [
  { value: 'technical', label: 'Technical / app issue' },
  { value: 'ticket', label: 'Ticket / booking' },
  { value: 'dispute_organizer', label: 'Dispute with organizer' },
  { value: 'account', label: 'Account / profile' },
  { value: 'other', label: 'Other' },
];

const CHAT_STORAGE = 'myticket_support_chat_thread';

type ChatMessage = {
  id: string;
  role: 'user' | 'agent';
  text: string;
  createdAt: string;
};

function loadChat(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(CHAT_STORAGE);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveChat(messages: ChatMessage[]) {
  sessionStorage.setItem(CHAT_STORAGE, JSON.stringify(messages));
}

export function SupportPage() {
  const { user } = useAuth();
  const { pushNotification } = useNotifications();
  const [tab, setTab] = useState<'chat' | 'ticket'>('chat');
  const [category, setCategory] = useState<SupportCategory>('ticket');
  const [subject, setSubject] = useState('');
  const [orderRef, setOrderRef] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatPending, setChatPending] = useState(false);
  const listEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setChatMessages(loadChat());
  }, []);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  const appendAgentReply = useCallback(
    (userText: string) => {
      const id = `agent_${Date.now()}`;
      const reply: ChatMessage = {
        id,
        role: 'agent',
        text: `Thanks for your message — we received: “${userText.slice(0, 120)}${userText.length > 120 ? '…' : ''}”. A specialist will follow up here (demo).`,
        createdAt: new Date().toISOString(),
      };
      setChatMessages((prev) => {
        const next = [...prev, reply];
        saveChat(next);
        return next;
      });
      pushNotification({
        title: 'Support replied',
        body: 'Open the chat tab to read the latest message (demo).',
        kind: 'support',
        href: '/support',
      });
      setChatPending(false);
    },
    [pushNotification]
  );

  function onSendChat(e: React.FormEvent) {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || !user) return;
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text,
      createdAt: new Date().toISOString(),
    };
    setChatMessages((prev) => {
      const next = [...prev, userMsg];
      saveChat(next);
      return next;
    });
    setChatInput('');
    setChatPending(true);
    window.setTimeout(() => appendAgentReply(text), 1800);
  }

  function onSubmitTicket(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    pushNotification({
      title: 'Case received',
      body: subject.trim() ? `We logged: ${subject.trim()}` : 'Your support request was saved (demo).',
      kind: 'support',
      href: '/support',
    });
    window.setTimeout(() => {
      pushNotification({
        title: 'Case update (demo)',
        body: 'Your ticket was marked resolved in the mock queue — no real backend.',
        kind: 'support',
        href: '/support',
      });
    }, 6000);
  }

  return (
    <div className="bg-white pb-20 pt-10">
      <div className="mx-auto max-w-[720px] px-6 lg:px-8">
        <h1 className="text-[32px] font-extrabold text-ink">Support</h1>
        <p className="mt-2 text-[15px] text-ink-60">
          Chat and tickets are simulated in the browser — messages persist for this session only.
        </p>

        <div className="mt-8 inline-flex rounded-full border border-ink-10 bg-ink-5/50 p-1">
          <button
            type="button"
            onClick={() => setTab('chat')}
            className={`rounded-full px-5 py-2 text-[13px] font-bold ${
              tab === 'chat' ? 'bg-ink text-white' : 'text-ink-60'
            }`}
          >
            Live chat (mock)
          </button>
          <button
            type="button"
            onClick={() => setTab('ticket')}
            className={`rounded-full px-5 py-2 text-[13px] font-bold ${
              tab === 'ticket' ? 'bg-ink text-white' : 'text-ink-60'
            }`}
          >
            Open a ticket
          </button>
        </div>

        {tab === 'chat' && (
          <div className="mt-8 rounded-2xl border border-ink-10 bg-ink-5/40 p-6">
            <h2 className="text-lg font-extrabold text-ink">Chat thread</h2>
            {user ? (
              <>
                <p className="mt-2 text-[14px] text-ink-60">Signed in as {user.email}</p>
                <div className="mt-4 max-h-[320px] space-y-3 overflow-y-auto rounded-xl border border-ink-10 bg-white p-4">
                  {chatMessages.length === 0 && (
                    <p className="text-[13px] text-ink-40">Say hello — a mock agent will reply after a short delay.</p>
                  )}
                  {chatMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-ink text-white'
                            : 'border border-ink-10 bg-ink-5/80 text-ink'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                  <div ref={listEndRef} />
                </div>
                <form onSubmit={onSendChat} className="mt-4 flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message…"
                    className="min-w-0 flex-1 rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral"
                    disabled={chatPending}
                  />
                  <Button type="submit" variant="dark" size="md" disabled={chatPending || !chatInput.trim()}>
                    Send
                  </Button>
                </form>
              </>
            ) : (
              <p className="mt-4 text-[14px] text-ink-60">
                <Link to="/login" className="font-semibold text-coral hover:underline">
                  Sign in
                </Link>{' '}
                to use the mock chat thread.
              </p>
            )}
          </div>
        )}

        {tab === 'ticket' && (
          <div className="mt-8">
            <h2 className="text-lg font-extrabold text-ink">Offline / ticketed request</h2>
            <p className="mt-2 text-[14px] text-ink-60">
              Routed to the admin support dashboard in production. Here you get in-app notifications only.
            </p>
            {sent ? (
              <p className="mt-6 rounded-xl bg-mint/20 p-4 text-[14px] text-ink">
                Request received. Reference your subject line for follow-up (demo — no server).
              </p>
            ) : (
              <form onSubmit={onSubmitTicket} className="mt-6 space-y-4">
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
        )}
      </div>
    </div>
  );
}

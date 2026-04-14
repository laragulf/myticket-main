import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="rounded-2xl border border-ink-10 bg-white p-8 shadow-card-md">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">Reset password</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-60">
        Enter your email and we&apos;ll send you a link to choose a new password. (Demo: no email is sent.)
      </p>

      {sent ? (
        <div className="mt-8 rounded-xl bg-mint/20 p-4 text-[14px] text-ink">
          If an account exists for <strong>{email}</strong>, check your inbox for reset instructions.
          <div className="mt-4">
            <Link to="/login" className="font-semibold text-coral hover:underline">
              Back to sign in
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-[12px] font-semibold text-ink-60">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral"
              placeholder="you@example.com"
            />
          </label>
          <Button type="submit" variant="dark" size="md" className="w-full">
            Send reset link
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-[13px] text-ink-40">
        <Link to="/login" className="font-semibold text-coral hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

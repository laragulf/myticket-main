import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDone(true);
  }

  return (
    <div className="rounded-2xl border border-ink-10 bg-white p-8 shadow-card-md">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">Set new password</h1>
      <p className="mt-2 text-[14px] text-ink-60">
        Token: <code className="rounded bg-ink-5 px-1 text-[12px]">{token ?? '(none — use link from email)'}</code>
      </p>

      {done ? (
        <div className="mt-8 rounded-xl bg-mint/20 p-4 text-[14px] text-ink">
          Password updated (demo).{' '}
          <Link to="/login" className="font-semibold text-coral hover:underline">
            Sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-[12px] font-semibold text-ink-60">New password</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral"
            />
          </label>
          <Button type="submit" variant="dark" size="md" className="w-full">
            Update password
          </Button>
        </form>
      )}
    </div>
  );
}

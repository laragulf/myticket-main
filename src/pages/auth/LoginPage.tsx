import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export function LoginPage() {
  const { signIn, signInGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setLoading(true);
    try {
      await signInGoogle();
      navigate(from, { replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-ink-10 bg-white p-8 shadow-card-md">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">Sign in</h1>
      <p className="mt-2 text-[14px] text-ink-60">
        New to MyTicket?{' '}
        <Link to="/register" className="font-semibold text-coral hover:underline">
          Create an account
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-[12px] font-semibold text-ink-60">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/25"
            placeholder="you@example.com"
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-semibold text-ink-60">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral"
            placeholder="••••••••"
          />
        </label>
        <div className="text-right">
          <Link to="/forgot-password" className="text-[13px] font-semibold text-coral hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" variant="dark" size="md" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-ink-10" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-[12px] font-medium text-ink-40">or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="md"
        className="w-full border-ink-20"
        onClick={onGoogle}
        disabled={loading}
      >
        Continue with Google
      </Button>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export function RegisterPage() {
  const { signUp, signInGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(name, email, password);
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setLoading(true);
    try {
      await signInGoogle();
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-ink-10 bg-white p-8 shadow-card-md">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">Create account</h1>
      <p className="mt-2 text-[14px] text-ink-60">
        Registration is only available on MyTicket.com. Already have an account?{' '}
        <Link to="/login" className="font-semibold text-coral hover:underline">
          Sign in
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-[12px] font-semibold text-ink-60">Full name</span>
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral"
            placeholder="Your name"
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-semibold text-ink-60">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral"
            placeholder="you@example.com"
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-semibold text-ink-60">Password</span>
          <input
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral"
            placeholder="At least 8 characters"
          />
        </label>
        <p className="text-[12px] text-ink-40">
          By registering you agree to the{' '}
          <Link to="/terms" className="font-semibold text-coral underline">
            Terms of Service
          </Link>
          .
        </p>
        <Button type="submit" variant="dark" size="md" className="w-full" loading={loading}>
          Create account
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

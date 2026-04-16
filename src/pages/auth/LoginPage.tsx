import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { getSafeRedirectPath } from '@/lib/navigation';
import { FormSectionCard } from '@/components/ui/form/FormSectionCard';
import { Field } from '@/components/ui/form/Field';
import { TextInput } from '@/components/ui/form/inputs';

export function LoginPage() {
  const { signIn, signInGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromRaw = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
  const from = getSafeRedirectPath(fromRaw) ?? '/';
  const registerState = { from: { pathname: from } };

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
    <FormSectionCard
      eyebrow="Welcome back"
      title="Sign in"
      description="Use your email and password to continue."
    >
      <p className="-mt-4 text-[14px] text-ink-60">
        New to MyTicket?{' '}
        <Link to="/register" state={registerState} className="font-semibold text-coral hover:underline">
          Create an account
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Email" htmlFor="login-email">
          <TextInput
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password" htmlFor="login-password">
          <TextInput
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-ink-40">Demo sign-in (no backend).</span>
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
    </FormSectionCard>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { FormSectionCard } from '@/components/ui/form/FormSectionCard';
import { Field } from '@/components/ui/form/Field';
import { InlineNotice } from '@/components/ui/form/InlineNotice';
import { TextInput } from '@/components/ui/form/inputs';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <FormSectionCard
      eyebrow="Account access"
      title="Reset password"
      description="Enter your email and we’ll send a link to choose a new password. (Demo: no email is sent.)"
    >
      {sent ? (
        <InlineNotice variant="success" title="Check your inbox">
          <p className="text-[13px] text-ink-60">
            If an account exists for <strong className="text-ink">{email}</strong>, you’ll receive reset instructions.
          </p>
          <div className="mt-3">
            <Link to="/login" className="font-semibold text-coral hover:underline">
              Back to sign in
            </Link>
          </div>
        </InlineNotice>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Email" htmlFor="forgot-email">
            <TextInput
              id="forgot-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </Field>
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
    </FormSectionCard>
  );
}

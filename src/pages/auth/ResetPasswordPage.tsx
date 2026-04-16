import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { FormSectionCard } from '@/components/ui/form/FormSectionCard';
import { Field } from '@/components/ui/form/Field';
import { InlineNotice } from '@/components/ui/form/InlineNotice';
import { TextInput } from '@/components/ui/form/inputs';

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
    <FormSectionCard
      eyebrow="Account access"
      title="Set new password"
      description="Choose a new password for your account. (Demo only.)"
    >
      <InlineNotice variant="info" title="Token (demo)">
        <code className="rounded bg-ink-5 px-1 text-[12px] text-ink">
          {token ?? '(none — use link from email)'}
        </code>
      </InlineNotice>

      {done ? (
        <InlineNotice variant="success" title="Password updated (demo)">
          <Link to="/login" className="font-semibold text-coral hover:underline">
            Sign in
          </Link>
        </InlineNotice>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="New password" htmlFor="new-password" helperText="At least 8 characters.">
            <TextInput
              id="new-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Button type="submit" variant="dark" size="md" className="w-full">
            Update password
          </Button>
        </form>
      )}
    </FormSectionCard>
  );
}

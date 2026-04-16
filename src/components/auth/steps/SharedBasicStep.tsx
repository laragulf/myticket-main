import type { BaseRegistrationFields } from '@/types/domain';
import { Field } from '@/components/ui/form/Field';
import { SaudiPhoneInput } from '@/components/ui/form/SaudiPhoneInput';
import { TextInput } from '@/components/ui/form/inputs';

interface SharedBasicStepProps {
  value: BaseRegistrationFields;
  onChange: (patch: Partial<BaseRegistrationFields>) => void;
  hideTerms?: boolean;
}

export function SharedBasicStep({ value, onChange, hideTerms = false }: SharedBasicStepProps) {
  return (
    <div className="space-y-4">
      <Field label="Full name" htmlFor="register-full-name">
        <TextInput
          id="register-full-name"
          type="text"
          required
          autoComplete="name"
          value={value.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          placeholder="Your full name"
        />
      </Field>
      <Field label="Email" htmlFor="register-email">
        <TextInput
          id="register-email"
          type="email"
          required
          autoComplete="email"
          value={value.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="you@example.com"
        />
      </Field>
      <Field label="Contact phone" htmlFor="register-phone">
        <SaudiPhoneInput
          id="register-phone"
          value={value.contactPhone}
          onChange={(next) => onChange({ contactPhone: next })}
        />
      </Field>
      <Field label="Password" htmlFor="register-password">
        <TextInput
          id="register-password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          value={value.password}
          onChange={(e) => onChange({ password: e.target.value })}
          placeholder="At least 8 characters"
        />
      </Field>
      {!hideTerms && (
        <label className="inline-flex items-center gap-2 text-[12px] text-ink-60">
          <input
            type="checkbox"
            checked={value.agreeTerms}
            onChange={(e) => onChange({ agreeTerms: e.target.checked })}
          />
          I agree to Terms of Service.
        </label>
      )}
    </div>
  );
}

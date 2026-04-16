import type { BaseRegistrationFields } from '@/types/domain';

interface SharedBasicStepProps {
  value: BaseRegistrationFields;
  onChange: (patch: Partial<BaseRegistrationFields>) => void;
  hideTerms?: boolean;
}

export function SharedBasicStep({ value, onChange, hideTerms = false }: SharedBasicStepProps) {
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-[12px] font-semibold text-ink-60">Full name</span>
        <input
          type="text"
          required
          autoComplete="name"
          value={value.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral"
          placeholder="Your full name"
        />
      </label>
      <label className="block">
        <span className="text-[12px] font-semibold text-ink-60">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={value.email}
          onChange={(e) => onChange({ email: e.target.value })}
          className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral"
          placeholder="you@example.com"
        />
      </label>
      <label className="block">
        <span className="text-[12px] font-semibold text-ink-60">Contact phone</span>
        <input
          value={value.contactPhone}
          onChange={(e) => onChange({ contactPhone: e.target.value })}
          className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral"
          placeholder="+966 ..."
        />
      </label>
      <label className="block">
        <span className="text-[12px] font-semibold text-ink-60">Password</span>
        <input
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          value={value.password}
          onChange={(e) => onChange({ password: e.target.value })}
          className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral"
          placeholder="At least 8 characters"
        />
      </label>
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

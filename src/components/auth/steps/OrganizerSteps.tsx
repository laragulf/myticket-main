import type { OrganizerOnboardingDraft } from '@/types/domain';

interface OrganizerStepsProps {
  step: number;
  draft: OrganizerOnboardingDraft;
  socialInput: string;
  setSocialInput: (value: string) => void;
  onChange: (patch: Partial<OrganizerOnboardingDraft>) => void;
}

export function OrganizerSteps({ step, draft, socialInput, setSocialInput, onChange }: OrganizerStepsProps) {
  if (step === 0) {
    return (
      <div className="space-y-3">
        <label className="block">
          <span className="text-[12px] font-semibold text-ink-60">Display name *</span>
          <input
            value={draft.displayName}
            onChange={(e) => onChange({ displayName: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-semibold text-ink-60">Profile image (URL or file name)</span>
          <input
            value={draft.profileImage}
            onChange={(e) => onChange({ profileImage: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-semibold text-ink-60">Bio *</span>
          <textarea
            rows={4}
            value={draft.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
          />
        </label>
      </div>
    );
  }
  if (step === 1) {
    return (
      <div className="space-y-3">
        <label className="block">
          <span className="text-[12px] font-semibold text-ink-60">Organizer email *</span>
          <input
            value={draft.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-semibold text-ink-60">Contacts (optional)</span>
          <input
            value={draft.contactPhone}
            onChange={(e) => onChange({ contactPhone: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-semibold text-ink-60">Location *</span>
          <input
            value={draft.location}
            onChange={(e) => onChange({ location: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-semibold text-ink-60">Document (optional)</span>
          <input
            value={draft.optionalDocument ?? ''}
            onChange={(e) => onChange({ optionalDocument: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
          />
        </label>
      </div>
    );
  }
  if (step === 2) {
    return (
      <div className="space-y-3">
        <label className="inline-flex items-center gap-2 text-[12px] text-ink-60">
          <input
            type="checkbox"
            checked={draft.isCompany}
            onChange={(e) => onChange({ isCompany: e.target.checked })}
          />
          This registration is for a company organizer
        </label>
        {draft.isCompany ? (
          <>
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">Company name *</span>
              <input
                value={draft.companyName ?? ''}
                onChange={(e) => onChange({ companyName: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">Company information *</span>
              <textarea
                rows={3}
                value={draft.companyInfo ?? ''}
                onChange={(e) => onChange({ companyInfo: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
              />
            </label>
          </>
        ) : null}
        <label className="block">
          <span className="text-[12px] font-semibold text-ink-60">Owner name *</span>
          <input
            value={draft.ownerName}
            onChange={(e) => onChange({ ownerName: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-semibold text-ink-60">Owner info *</span>
          <textarea
            rows={3}
            value={draft.ownerInfo}
            onChange={(e) => onChange({ ownerInfo: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
          />
        </label>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-[12px] font-semibold text-ink-60">Social media (optional)</p>
      <div className="flex gap-2">
        <input
          value={socialInput}
          onChange={(e) => setSocialInput(e.target.value)}
          className="w-full rounded-xl border border-ink-10 px-4 py-2.5 text-[14px]"
          placeholder="https://instagram.com/..."
        />
        <button
          type="button"
          onClick={() => {
            const value = socialInput.trim();
            if (!value) return;
            if (!draft.socialLinks.includes(value)) {
              onChange({ socialLinks: [...draft.socialLinks, value] });
            }
            setSocialInput('');
          }}
          className="rounded-xl border border-ink-10 px-3 text-[12px] font-semibold hover:bg-ink-5"
        >
          Add
        </button>
      </div>
      <ul className="space-y-1">
        {draft.socialLinks.map((item) => (
          <li key={item} className="flex items-center justify-between rounded-lg border border-ink-10 px-3 py-2 text-[12px] text-ink-60">
            <span className="truncate pr-2">{item}</span>
            <button
              type="button"
              onClick={() => onChange({ socialLinks: draft.socialLinks.filter((x) => x !== item) })}
              className="font-semibold text-coral"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

import type { VendorOnboardingDraft } from '@/types/domain';

interface VendorStepsProps {
  step: number;
  draft: VendorOnboardingDraft;
  tempInput: string;
  setTempInput: (value: string) => void;
  onChange: (patch: Partial<VendorOnboardingDraft>) => void;
}

export function VendorSteps({ step, draft, tempInput, setTempInput, onChange }: VendorStepsProps) {
  if (step === 0) {
    return (
      <div className="space-y-3">
        <label className="block">
          <span className="text-[12px] font-semibold text-ink-60">Business / profile name *</span>
          <input
            value={draft.profileName}
            onChange={(e) => onChange({ profileName: e.target.value })}
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
        <p className="text-[12px] font-semibold text-ink-60">Service categories *</p>
        <div className="flex gap-2">
          <input
            value={tempInput}
            onChange={(e) => setTempInput(e.target.value)}
            className="w-full rounded-xl border border-ink-10 px-4 py-2.5 text-[14px]"
            placeholder="e.g. Security, Lighting"
          />
          <button
            type="button"
            onClick={() => {
              const value = tempInput.trim();
              if (!value) return;
              if (!draft.serviceCategories.includes(value)) {
                onChange({ serviceCategories: [...draft.serviceCategories, value] });
              }
              setTempInput('');
            }}
            className="rounded-xl border border-ink-10 px-3 text-[12px] font-semibold hover:bg-ink-5"
          >
            Add
          </button>
        </div>
        <ul className="space-y-1">
          {draft.serviceCategories.map((item) => (
            <li key={item} className="flex items-center justify-between rounded-lg border border-ink-10 px-3 py-2 text-[12px] text-ink-60">
              <span>{item}</span>
              <button
                type="button"
                onClick={() => onChange({ serviceCategories: draft.serviceCategories.filter((x) => x !== item) })}
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
  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-[12px] font-semibold text-ink-60">Verification document *</span>
        <input
          value={draft.verificationDocuments[0] ?? ''}
          onChange={(e) => onChange({ verificationDocuments: e.target.value.trim() ? [e.target.value.trim()] : [] })}
          className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
          placeholder="Business license file name or URL"
        />
      </label>
      <label className="block">
        <span className="text-[12px] font-semibold text-ink-60">City</span>
        <input
          value={draft.city}
          onChange={(e) => onChange({ city: e.target.value })}
          className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
        />
      </label>
      <label className="block">
        <span className="text-[12px] font-semibold text-ink-60">Coverage area</span>
        <input
          value={draft.coverageArea}
          onChange={(e) => onChange({ coverageArea: e.target.value })}
          className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
          placeholder="e.g. Riyadh + Eastern Province"
        />
      </label>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import type { VendorOnboardingDraft } from '@/types/domain';
import { TALENT_BIO_MAX_CHARS, VENDOR_BIO_MIN_CHARS } from '@/lib/onboardingValidation';
import { getCitiesForRegion, SAUDI_REGIONS } from '@/lib/saudiLocations';

interface VendorStepsProps {
  step: number;
  draft: VendorOnboardingDraft;
  tempInput: string;
  setTempInput: (value: string) => void;
  onChange: (patch: Partial<VendorOnboardingDraft>) => void;
}

export function VendorSteps({ step, draft, tempInput, setTempInput, onChange }: VendorStepsProps) {
  const [docInput, setDocInput] = useState('');
  const [saudiRegionId, setSaudiRegionId] = useState('');
  const vendorCities = useMemo(() => getCitiesForRegion(saudiRegionId), [saudiRegionId]);
  const bioLen = draft.bio.trim().length;

  useEffect(() => {
    const match = SAUDI_REGIONS.find((region) =>
      getCitiesForRegion(region.id).some((city) => city.name.toLowerCase() === draft.city.trim().toLowerCase())
    );
    setSaudiRegionId(match?.id ?? '');
  }, [draft.city]);

  if (step === 0) {
    return (
      <div className="space-y-4">
        <label className="block">
          <span className="text-[12px] font-semibold text-ink-60">Business / profile name *</span>
          <input
            value={draft.profileName}
            onChange={(e) => onChange({ profileName: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
          />
        </label>
        <label className="block">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[12px] font-semibold text-ink-60">Bio *</span>
            <span
              className={
                bioLen >= VENDOR_BIO_MIN_CHARS && bioLen <= TALENT_BIO_MAX_CHARS
                  ? 'text-[11px] font-bold text-mint-dark'
                  : 'text-[11px] font-bold text-ink-40'
              }
            >
              {bioLen} / {TALENT_BIO_MAX_CHARS} (min {VENDOR_BIO_MIN_CHARS})
            </span>
          </div>
          <textarea
            rows={5}
            maxLength={TALENT_BIO_MAX_CHARS}
            value={draft.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
            placeholder="Share your services, experience, and specialties."
          />
        </label>
      </div>
    );
  }
  if (step === 1) {
    return (
      <div className="space-y-4">
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
    <div className="space-y-4">
      <div className="rounded-xl border border-ink-10 bg-ink-5/50 p-4">
        <p className="text-[12px] font-semibold text-ink-60">Verification document *</p>
        <p className="mt-1 text-[11px] text-ink-40">Add your license URL or upload a file (demo).</p>
        <div className="mt-3 flex gap-2">
          <input
            value={docInput}
            onChange={(e) => setDocInput(e.target.value)}
            className="w-full rounded-xl border border-ink-10 bg-white px-4 py-2.5 text-[14px]"
            placeholder="Business license URL"
          />
          <button
            type="button"
            onClick={() => {
              const value = docInput.trim();
              if (!value || draft.verificationDocuments.includes(value)) return;
              onChange({ verificationDocuments: [...draft.verificationDocuments, value] });
              setDocInput('');
            }}
            className="rounded-xl border border-ink-10 px-3 text-[12px] font-semibold hover:bg-ink-5"
          >
            Add
          </button>
        </div>
        <label className="mt-2 flex cursor-pointer flex-col rounded-xl border border-dashed border-ink-20 bg-white px-4 py-3 text-[12px] font-semibold text-ink-60 hover:bg-ink-5">
          <span>Upload document</span>
          <span className="mt-0.5 text-[11px] font-normal text-ink-40">pdf, image, or scan</span>
          <input
            type="file"
            accept="image/*,.pdf,application/pdf"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                const fileValue = `document:${f.name}`;
                if (!draft.verificationDocuments.includes(fileValue)) {
                  onChange({ verificationDocuments: [...draft.verificationDocuments, fileValue] });
                }
              }
              e.target.value = '';
            }}
          />
        </label>
        {draft.verificationDocuments.length > 0 && (
          <ul className="mt-2 space-y-1">
            {draft.verificationDocuments.map((item) => (
              <li
                key={item}
                className="flex items-center justify-between rounded-lg border border-ink-10 bg-white px-3 py-2 text-[12px] text-ink-60"
              >
                <span className="truncate pr-2">{item}</span>
                <button
                  type="button"
                  onClick={() =>
                    onChange({ verificationDocuments: draft.verificationDocuments.filter((x) => x !== item) })
                  }
                  className="font-semibold text-coral"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <label className="block">
        <span className="text-[12px] font-semibold text-ink-60">Saudi region *</span>
        <select
          value={saudiRegionId}
          onChange={(e) => {
            const id = e.target.value;
            setSaudiRegionId(id);
            onChange({ city: '' });
          }}
          className="mt-1.5 w-full rounded-xl border border-ink-10 bg-white px-4 py-3 text-[14px]"
        >
          <option value="">Select region</option>
          {SAUDI_REGIONS.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-[12px] font-semibold text-ink-60">City *</span>
        <select
          value={draft.city}
          onChange={(e) => onChange({ city: e.target.value })}
          disabled={!saudiRegionId}
          className="mt-1.5 w-full rounded-xl border border-ink-10 bg-white px-4 py-3 text-[14px] disabled:cursor-not-allowed disabled:bg-ink-5 disabled:text-ink-40"
        >
          <option value="">{saudiRegionId ? 'Select city' : 'Choose a region first'}</option>
          {vendorCities.map((city) => (
            <option key={city.id} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
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

import type { TalentOnboardingDraft } from '@/types/domain';
import { ProfileImageAvatarInput } from '@/components/auth/ProfileImageAvatarInput';
import { TALENT_BIO_MAX_CHARS, TALENT_BIO_MIN_CHARS } from '@/lib/onboardingValidation';
import { getCitiesForRegion, SAUDI_REGIONS } from '@/lib/saudiLocations';

interface TalentStepsProps {
  step: number;
  draft: TalentOnboardingDraft;
  mediaInput: string;
  setMediaInput: (value: string) => void;
  onChange: (patch: Partial<TalentOnboardingDraft>) => void;
}

function appendMedia(draft: TalentOnboardingDraft, value: string, onChange: (patch: Partial<TalentOnboardingDraft>) => void) {
  const v = value.trim();
  if (!v || draft.verificationMedia.includes(v)) return;
  onChange({ verificationMedia: [...draft.verificationMedia, v] });
}

export function TalentSteps({ step, draft, mediaInput, setMediaInput, onChange }: TalentStepsProps) {
  const bioLen = draft.bio.trim().length;
  const cities = getCitiesForRegion(draft.saudiRegionId);

  if (step === 0) {
    return (
      <div className="space-y-4">
        <ProfileImageAvatarInput
          value={draft.profileImage}
          onChange={(next) => onChange({ profileImage: next })}
          displayName={draft.fullName.trim() || 'User'}
        />

        <label className="block">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[12px] font-semibold text-ink-60">Talent bio *</span>
            <span
              className={
                bioLen >= TALENT_BIO_MIN_CHARS && bioLen <= TALENT_BIO_MAX_CHARS
                  ? 'text-[11px] font-bold text-mint-dark'
                  : 'text-[11px] font-bold text-ink-40'
              }
            >
              {bioLen} / {TALENT_BIO_MAX_CHARS} (min {TALENT_BIO_MIN_CHARS})
            </span>
          </div>
          <textarea
            rows={5}
            maxLength={TALENT_BIO_MAX_CHARS}
            value={draft.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
            placeholder="Share your skills, experience, and specialties."
          />
        </label>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-[12px] font-semibold text-ink-60">Verification uploads *</p>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-40">
            Add at least one item: video file, image file, URL (video or image), or certificate document.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={mediaInput}
            onChange={(e) => setMediaInput(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-ink-10 px-4 py-2.5 text-[14px]"
            placeholder="Paste URL (https://…)"
          />
          <button
            type="button"
            onClick={() => {
              appendMedia(draft, mediaInput, onChange);
              setMediaInput('');
            }}
            className="shrink-0 rounded-xl border border-ink-10 px-4 py-2.5 text-[12px] font-semibold hover:bg-ink-5"
          >
            Add URL
          </button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex cursor-pointer flex-col rounded-xl border border-dashed border-ink-20 bg-ink-5/50 px-4 py-3 text-[12px] font-semibold text-ink-60 hover:bg-ink-5">
            <span>Video file</span>
            <span className="mt-0.5 text-[11px] font-normal text-ink-40">mp4, webm, mov…</span>
            <input
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) appendMedia(draft, `video:${f.name}`, onChange);
                e.target.value = '';
              }}
            />
          </label>
          <label className="flex cursor-pointer flex-col rounded-xl border border-dashed border-ink-20 bg-ink-5/50 px-4 py-3 text-[12px] font-semibold text-ink-60 hover:bg-ink-5">
            <span>Image file</span>
            <span className="mt-0.5 text-[11px] font-normal text-ink-40">jpg, png, webp…</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) appendMedia(draft, `image:${f.name}`, onChange);
                e.target.value = '';
              }}
            />
          </label>
          <label className="flex cursor-pointer flex-col rounded-xl border border-dashed border-ink-20 bg-ink-5/50 px-4 py-3 text-[12px] font-semibold text-ink-60 hover:bg-ink-5 sm:col-span-2">
            <span>Certificate or document</span>
            <span className="mt-0.5 text-[11px] font-normal text-ink-40">pdf, image, or scan</span>
            <input
              type="file"
              accept="image/*,.pdf,application/pdf"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) appendMedia(draft, `certificate:${f.name}`, onChange);
                e.target.value = '';
              }}
            />
          </label>
        </div>

        {draft.verificationMedia.length > 0 && (
          <ul className="space-y-1">
            {draft.verificationMedia.map((item) => (
              <li
                key={item}
                className="flex items-center justify-between gap-2 rounded-lg border border-ink-10 px-3 py-2 text-[12px] text-ink-60"
              >
                <span className="min-w-0 truncate">{item}</span>
                <button
                  type="button"
                  onClick={() => onChange({ verificationMedia: draft.verificationMedia.filter((x) => x !== item) })}
                  className="shrink-0 font-semibold text-coral"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-[12px] font-semibold text-ink-60">Saudi region *</span>
        <select
          value={draft.saudiRegionId}
          onChange={(e) => {
            const id = e.target.value;
            onChange({ saudiRegionId: id, city: '' });
          }}
          className="mt-1.5 w-full rounded-xl border border-ink-10 bg-white px-4 py-3 text-[14px]"
        >
          <option value="">Select region</option>
          {SAUDI_REGIONS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-[12px] font-semibold text-ink-60">City *</span>
        <select
          value={draft.city}
          onChange={(e) => onChange({ city: e.target.value })}
          disabled={!draft.saudiRegionId}
          className="mt-1.5 w-full rounded-xl border border-ink-10 bg-white px-4 py-3 text-[14px] disabled:cursor-not-allowed disabled:bg-ink-5 disabled:text-ink-40"
        >
          <option value="">{draft.saudiRegionId ? 'Select city' : 'Choose a region first'}</option>
          {cities.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="inline-flex items-center gap-2 text-[12px] text-ink-60">
        <input
          type="checkbox"
          checked={draft.locationPublic}
          onChange={(e) => onChange({ locationPublic: e.target.checked })}
        />
        Show my city publicly
      </label>
      <label className="inline-flex items-center gap-2 text-[12px] text-ink-60">
        <input
          type="checkbox"
          checked={draft.acceptedQualityDisclaimer}
          onChange={(e) => onChange({ acceptedQualityDisclaimer: e.target.checked })}
        />
        I acknowledge upload quality requirements.
      </label>
    </div>
  );
}

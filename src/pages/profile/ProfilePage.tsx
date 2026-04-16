import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { queueTicketsForAccountDeletionMock } from '@/services/ticketsService';
import type { OnboardingRole, RoleOnboardingStatus, TalentOnboardingDraft } from '@/types/domain';
import { ProfileImageAvatarInput } from '@/components/auth/ProfileImageAvatarInput';
import { isTalentDraftReady, TALENT_BIO_MIN_CHARS } from '@/lib/onboardingValidation';
import { getCitiesForRegion, SAUDI_REGIONS } from '@/lib/saudiLocations';

const EMPTY_DRAFT: TalentOnboardingDraft = {
  fullName: '',
  contactEmail: '',
  contactPhone: '',
  profileImage: '',
  bio: '',
  saudiRegionId: '',
  city: '',
  travelReady: false,
  locationPublic: false,
  verificationMedia: [],
  certificateName: '',
  acceptedQualityDisclaimer: false,
};
const SAUDI_COUNTRY_CODE = '+966';

type ProfileTab = 'info' | 'preferences' | 'security' | 'roles' | 'danger';

export function ProfilePage() {
  const { pushNotification } = useNotifications();
  const {
    user,
    signOut,
    updateAccountInfo,
    updatePreferences,
    updateSecuritySettings,
    changePasswordMock,
    saveTalentDraft,
    submitTalentApplication,
    reviewTalentApplication,
    resetTalentApplicationForResubmit,
    reviewRoleOnboarding,
    resetRoleOnboardingForResubmit,
  } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('info');
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [region, setRegion] = useState(user?.region ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [profileImage, setProfileImage] = useState(user?.profileImage ?? '');
  const [language, setLanguage] = useState<'en' | 'ar'>(user?.preferences.language ?? 'en');
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>(user?.preferences.theme ?? 'system');
  const [emailNotifications, setEmailNotifications] = useState(user?.preferences.emailNotifications ?? true);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(user?.preferences.pushNotifications ?? true);
  const [smsNotifications, setSmsNotifications] = useState(user?.preferences.smsNotifications ?? false);
  const [marketingEmails, setMarketingEmails] = useState(user?.preferences.marketingEmails ?? false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.security.twoFactorEnabled ?? false);
  const [draft, setDraft] = useState<TalentOnboardingDraft>(user?.talentDraft ?? EMPTY_DRAFT);
  const [mediaInput, setMediaInput] = useState('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const mappedRegion = SAUDI_REGIONS.find((r) => r.id === user.region || r.name === user.region)?.id ?? '';
    const normalizedPhone = user.phone.startsWith(SAUDI_COUNTRY_CODE)
      ? user.phone.slice(SAUDI_COUNTRY_CODE.length).trim()
      : user.phone.replace(/^\+/, '').trim();
    setName(user.name);
    setEmail(user.email);
    setPhone(normalizedPhone);
    setRegion(mappedRegion);
    setCity(user.city);
    setBio(user.bio);
    setProfileImage(user.profileImage);
    setLanguage(user.preferences.language);
    setTheme(user.preferences.theme);
    setEmailNotifications(user.preferences.emailNotifications);
    setPushNotificationsEnabled(user.preferences.pushNotifications);
    setSmsNotifications(user.preferences.smsNotifications);
    setMarketingEmails(user.preferences.marketingEmails);
    setTwoFactorEnabled(user.security.twoFactorEnabled);
    setDraft(user.talentDraft ?? EMPTY_DRAFT);
  }, [user]);

  const requiredReady = useMemo(() => {
    return draft.fullName.trim().length >= 3 && draft.contactEmail.includes('@') && isTalentDraftReady(draft);
  }, [draft]);

  const statusBadge = useMemo(() => {
    if (!user) return null;
    if (user.talentApplicationStatus === 'approved') return 'Approved as Talent';
    if (user.talentApplicationStatus === 'submitted') return 'Under admin review';
    if (user.talentApplicationStatus === 'rejected') return 'Rejected';
    if (user.talentApplicationStatus === 'draft') return 'Draft in progress';
    return 'Not started';
  }, [user]);

  function onSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    updateAccountInfo({
      name,
      email,
      phone: `${SAUDI_COUNTRY_CODE}${phone.trim()}`,
      region,
      city,
      bio,
      profileImage,
    });
    setSaveMessage('Profile info saved (mock).');
  }

  function onSavePreferences(e: React.FormEvent) {
    e.preventDefault();
    updatePreferences({
      language,
      theme,
      emailNotifications,
      pushNotifications: pushNotificationsEnabled,
      smsNotifications,
      marketingEmails,
    });
    setSaveMessage('Preferences saved (mock).');
  }

  function onSaveSecurity(e: React.FormEvent) {
    e.preventDefault();
    updateSecuritySettings({
      twoFactorEnabled,
    });
    setSaveMessage('Security settings updated (mock).');
  }

  function onSaveDraft() {
    saveTalentDraft(draft);
    setSaveMessage('Talent application draft saved.');
  }

  function onSubmitApplication() {
    if (!requiredReady) return;
    saveTalentDraft(draft);
    submitTalentApplication();
    setSaveMessage('Application submitted for admin review.');
  }

  function appendVerificationItem(value: string) {
    const v = value.trim();
    if (!v) return;
    setDraft((prev) => {
      if (prev.verificationMedia.includes(v)) return prev;
      return { ...prev, verificationMedia: [...prev.verificationMedia, v] };
    });
  }

  const talentCities = getCitiesForRegion(draft.saudiRegionId);
  const accountCities = getCitiesForRegion(region);
  const bioLen = draft.bio.trim().length;

  function statusText(status: RoleOnboardingStatus) {
    if (status === 'approved') return 'Approved';
    if (status === 'submitted') return 'Under review';
    if (status === 'rejected') return 'Rejected';
    if (status === 'draft') return 'Draft';
    return 'Not started';
  }

  function renderRoleCard(role: OnboardingRole, title: string, status: RoleOnboardingStatus, rejectionReason?: string) {
    const isSubmitted = status === 'submitted';
    const isRejected = status === 'rejected';
    const isApproved = status === 'approved';
    return (
      <article className="rounded-xl border border-ink-10 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-bold text-ink">{title}</p>
          <span className="rounded-full bg-ink-5 px-2.5 py-1 text-[11px] font-semibold text-ink-60">{statusText(status)}</span>
        </div>
        {isRejected && (
          <p className="mt-2 text-[12px] text-coral">
            Rejection reason: {rejectionReason ?? 'Please review your submitted details.'}
          </p>
        )}
        {isApproved ? (
          <p className="mt-2 text-[12px] text-mint-dark">Role is active.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {isRejected && (
              <Button type="button" variant="outline" size="md" onClick={() => resetRoleOnboardingForResubmit(role)}>
                Revise
              </Button>
            )}
            {isSubmitted && (
              <>
                <Button type="button" variant="dark" size="md" onClick={() => reviewRoleOnboarding(role, 'approved')}>
                  Simulate approve
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => reviewRoleOnboarding(role, 'rejected', 'Please complete all required profile details.')}
                >
                  Simulate reject
                </Button>
              </>
            )}
          </div>
        )}
      </article>
    );
  }

  return (
    <div className="bg-white pb-20 pt-10">
      <div className="mx-auto max-w-[720px] px-6 lg:px-8">
        <h1 className="text-[32px] font-extrabold text-ink">Account</h1>
        <p className="mt-2 text-[15px] text-ink-60">Profile, role onboarding, and deletion (frontend mock).</p>
        {saveMessage && (
          <p className="mt-3 rounded-lg border border-ink-10 bg-ink-5 px-3 py-2 text-[12px] font-semibold text-ink-60">
            {saveMessage}
          </p>
        )}

        <div className="mt-8 grid w-full grid-cols-2 gap-1 rounded-2xl border border-ink-10 bg-ink-5/60 p-1 sm:grid-cols-3 lg:grid-cols-5">
          {(['info', 'preferences', 'security', 'roles', 'danger'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`w-full rounded-xl px-4 py-2 text-center text-[12px] font-semibold ${
                activeTab === tab ? 'bg-ink text-white' : 'text-ink-60 hover:bg-white'
              }`}
            >
              {tab === 'info'
                ? 'Info'
                : tab === 'preferences'
                  ? 'Preferences'
                  : tab === 'security'
                    ? 'Security'
                    : tab === 'roles'
                      ? 'Roles'
                      : 'Danger'}
            </button>
          ))}
        </div>

        {activeTab === 'info' && (
          <form onSubmit={onSaveProfile} className="mt-10 space-y-4 rounded-2xl border border-ink-10 p-6">
            <h2 className="text-lg font-extrabold text-ink">Profile info</h2>
            <div className="mb-2">
              <ProfileImageAvatarInput
                value={profileImage}
                onChange={setProfileImage}
                displayName={name.trim() || user?.name || 'User'}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[12px] font-semibold text-ink-60">Display name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
                />
              </label>
              <label className="block">
                <span className="text-[12px] font-semibold text-ink-60">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
                />
              </label>
              <label className="block">
                <span className="text-[12px] font-semibold text-ink-60">Phone</span>
                <div className="mt-1.5 flex overflow-hidden rounded-xl border border-ink-10">
                  <input
                    value={SAUDI_COUNTRY_CODE}
                    readOnly
                    disabled
                    className="w-20 border-r border-ink-10 bg-ink-5 px-3 py-3 text-center text-[14px] font-semibold text-ink-40"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ''))}
                    placeholder="5XXXXXXXX"
                    className="min-w-0 flex-1 px-4 py-3 text-[14px] outline-none"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-[12px] font-semibold text-ink-60">Region</span>
                <select
                  value={region}
                  onChange={(e) => {
                    const id = e.target.value;
                    setRegion(id);
                    setCity('');
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
              <label className="block sm:col-span-2">
                <span className="text-[12px] font-semibold text-ink-60">City</span>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!region}
                  className="mt-1.5 w-full rounded-xl border border-ink-10 bg-white px-4 py-3 text-[14px] disabled:cursor-not-allowed disabled:bg-ink-5 disabled:text-ink-40"
                >
                  <option value="">{region ? 'Select city' : 'Choose a region first'}</option>
                  {accountCities.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="text-[12px] font-semibold text-ink-60">Bio</span>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
                  placeholder="Tell people about yourself."
                />
              </label>
            </div>
            <Button type="submit" variant="dark" size="md">
              Save info
            </Button>
          </form>
        )}

        {activeTab === 'preferences' && (
          <form onSubmit={onSavePreferences} className="mt-10 space-y-4 rounded-2xl border border-ink-10 p-6">
            <h2 className="text-lg font-extrabold text-ink">Preferences</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[12px] font-semibold text-ink-60">Language</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
                  className="mt-1.5 w-full rounded-xl border border-ink-10 bg-white px-4 py-3 text-[14px]"
                >
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                </select>
              </label>
              <label className="block">
                <span className="text-[12px] font-semibold text-ink-60">Theme</span>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as 'system' | 'light' | 'dark')}
                  className="mt-1.5 w-full rounded-xl border border-ink-10 bg-white px-4 py-3 text-[14px]"
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </label>
              <label className="inline-flex items-center gap-2 text-[13px] text-ink-60">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
                Email notifications
              </label>
              <label className="inline-flex items-center gap-2 text-[13px] text-ink-60">
                <input
                  type="checkbox"
                  checked={pushNotificationsEnabled}
                  onChange={(e) => setPushNotificationsEnabled(e.target.checked)}
                />
                Push notifications
              </label>
              <label className="inline-flex items-center gap-2 text-[13px] text-ink-60">
                <input
                  type="checkbox"
                  checked={smsNotifications}
                  onChange={(e) => setSmsNotifications(e.target.checked)}
                />
                SMS notifications
              </label>
              <label className="inline-flex items-center gap-2 text-[13px] text-ink-60">
                <input
                  type="checkbox"
                  checked={marketingEmails}
                  onChange={(e) => setMarketingEmails(e.target.checked)}
                />
                Marketing emails
              </label>
            </div>
            <Button type="submit" variant="dark" size="md">
              Save preferences
            </Button>
          </form>
        )}

        {activeTab === 'security' && (
          <form onSubmit={onSaveSecurity} className="mt-10 space-y-4 rounded-2xl border border-ink-10 p-6">
            <h2 className="text-lg font-extrabold text-ink">Security</h2>
            <label className="inline-flex items-center gap-2 text-[13px] text-ink-60">
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(e) => setTwoFactorEnabled(e.target.checked)}
              />
              Enable 2FA (mock)
            </label>
            <p className="text-[12px] text-ink-40">
              Last password change: {new Date(user?.security.lastPasswordChangedAt ?? Date.now()).toLocaleString()}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="dark" size="md">
                Save security
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  changePasswordMock();
                  setSaveMessage('Password updated (mock).');
                }}
              >
                Change password (mock)
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'roles' && (
          <>
            <div className="mt-10 rounded-2xl border border-ink-10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-ink">Talent onboarding</h2>
            <span className="rounded-full bg-ink-5 px-3 py-1 text-[11px] font-semibold text-ink-60">{statusBadge}</span>
          </div>
          <p className="mt-2 text-[14px] text-ink-60">
            Complete your Talent profile to be listed in Marketplace. Admin reviews submitted applications.
          </p>

          {user?.talentApplicationStatus === 'approved' ? (
            <div className="mt-4 rounded-xl border border-mint/40 bg-mint/15 p-4 text-[13px] text-ink-60">
              <p className="font-semibold text-mint-dark">Talent role active.</p>
              <p className="mt-1">Your profile is approved and visible in relevant marketplace flows (mock).</p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {user?.talentApplicationStatus === 'submitted' && (
                <div className="rounded-xl border border-lemon/50 bg-lemon/15 p-4 text-[13px] text-ink-60">
                  <p className="font-semibold text-ink">Submitted and waiting for admin review.</p>
                  <p className="mt-1">In this mock, use the simulation buttons below to approve or reject.</p>
                </div>
              )}
              {user?.talentApplicationStatus === 'rejected' && (
                <div className="rounded-xl border border-coral/40 bg-coral/10 p-4 text-[13px] text-ink-60">
                  <p className="font-semibold text-coral">Application rejected.</p>
                  <p className="mt-1">Reason: {user.talentRejectedReason ?? 'Please update verification media quality.'}</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[12px] font-semibold text-ink-60">Full name *</span>
                  <input
                    value={draft.fullName}
                    disabled={user?.talentApplicationStatus === 'submitted'}
                    onChange={(e) => setDraft((prev) => ({ ...prev, fullName: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
                  />
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold text-ink-60">Contact email *</span>
                  <input
                    type="email"
                    value={draft.contactEmail}
                    disabled={user?.talentApplicationStatus === 'submitted'}
                    onChange={(e) => setDraft((prev) => ({ ...prev, contactEmail: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
                  />
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold text-ink-60">Contact phone</span>
                  <input
                    value={draft.contactPhone}
                    disabled={user?.talentApplicationStatus === 'submitted'}
                    onChange={(e) => setDraft((prev) => ({ ...prev, contactPhone: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
                    placeholder="+966 ..."
                  />
                </label>
                <div className="sm:col-span-2">
                  <ProfileImageAvatarInput
                    value={draft.profileImage}
                    onChange={(next) => setDraft((prev) => ({ ...prev, profileImage: next }))}
                    displayName={draft.fullName.trim() || user?.name || 'User'}
                    disabled={user?.talentApplicationStatus === 'submitted'}
                  />
                </div>
                <label className="block">
                  <span className="text-[12px] font-semibold text-ink-60">Saudi region *</span>
                  <select
                    value={draft.saudiRegionId}
                    disabled={user?.talentApplicationStatus === 'submitted'}
                    onChange={(e) => {
                      const id = e.target.value;
                      setDraft((prev) => ({ ...prev, saudiRegionId: id, city: '' }));
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
                    disabled={user?.talentApplicationStatus === 'submitted' || !draft.saudiRegionId}
                    onChange={(e) => setDraft((prev) => ({ ...prev, city: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-ink-10 bg-white px-4 py-3 text-[14px] disabled:cursor-not-allowed disabled:bg-ink-5 disabled:text-ink-40"
                  >
                    <option value="">{draft.saudiRegionId ? 'Select city' : 'Choose a region first'}</option>
                    {talentCities.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[12px] font-semibold text-ink-60">Bio (skills and experience) *</span>
                    <span
                      className={
                        bioLen >= TALENT_BIO_MIN_CHARS
                          ? 'text-[11px] font-bold text-mint-dark'
                          : 'text-[11px] font-bold text-ink-40'
                      }
                    >
                      {bioLen} / {TALENT_BIO_MIN_CHARS} minimum characters
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={draft.bio}
                    disabled={user?.talentApplicationStatus === 'submitted'}
                    onChange={(e) => setDraft((prev) => ({ ...prev, bio: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px]"
                    placeholder="Describe specialties, years of experience, and performance style."
                  />
                </label>
              </div>

              <div className="rounded-xl border border-ink-10 bg-ink-5/50 p-4">
                <p className="text-[12px] font-semibold text-ink-60">Verification uploads *</p>
                <p className="mt-1 text-[12px] text-ink-40">
                  Add at least one: video file, image file, URL, or certificate document.
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={mediaInput}
                    disabled={user?.talentApplicationStatus === 'submitted'}
                    onChange={(e) => setMediaInput(e.target.value)}
                    placeholder="Paste URL (https://…)"
                    className="min-w-0 flex-1 rounded-xl border border-ink-10 bg-white px-4 py-2.5 text-[14px]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    disabled={user?.talentApplicationStatus === 'submitted'}
                    onClick={() => {
                      appendVerificationItem(mediaInput);
                      setMediaInput('');
                    }}
                  >
                    Add URL
                  </Button>
                </div>
                {user?.talentApplicationStatus !== 'submitted' && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <label className="flex cursor-pointer flex-col rounded-xl border border-dashed border-ink-20 bg-white px-4 py-3 text-[12px] font-semibold text-ink-60 hover:bg-ink-5">
                      <span>Video file</span>
                      <span className="mt-0.5 text-[11px] font-normal text-ink-40">mp4, webm…</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) appendVerificationItem(`video:${f.name}`);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <label className="flex cursor-pointer flex-col rounded-xl border border-dashed border-ink-20 bg-white px-4 py-3 text-[12px] font-semibold text-ink-60 hover:bg-ink-5">
                      <span>Image file</span>
                      <span className="mt-0.5 text-[11px] font-normal text-ink-40">jpg, png…</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) appendVerificationItem(`image:${f.name}`);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <label className="flex cursor-pointer flex-col rounded-xl border border-dashed border-ink-20 bg-white px-4 py-3 text-[12px] font-semibold text-ink-60 hover:bg-ink-5 sm:col-span-2">
                      <span>Certificate or document</span>
                      <span className="mt-0.5 text-[11px] font-normal text-ink-40">pdf or image scan</span>
                      <input
                        type="file"
                        accept="image/*,.pdf,application/pdf"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) appendVerificationItem(`certificate:${f.name}`);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                )}
                {draft.verificationMedia.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {draft.verificationMedia.map((item) => (
                      <li key={item} className="flex items-center justify-between rounded-lg border border-ink-10 bg-white px-3 py-2 text-[12px] text-ink-60">
                        <span className="truncate pr-3">{item}</span>
                        {user?.talentApplicationStatus !== 'submitted' && (
                          <button
                            type="button"
                            onClick={() =>
                              setDraft((prev) => ({
                                ...prev,
                                verificationMedia: prev.verificationMedia.filter((media) => media !== item),
                              }))
                            }
                            className="font-semibold text-coral"
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-xl border border-lemon bg-lemon/15 p-4">
                <p className="text-[12px] font-semibold text-ink">Upload quality disclaimer</p>
                <p className="mt-1 text-[12px] text-ink-60">
                  Uploaded verification media must be clear, well-lit, and represent your actual work. Low quality may
                  cause rejection in admin review.
                </p>
                <label className="mt-3 inline-flex items-center gap-2 text-[12px] text-ink-60">
                  <input
                    type="checkbox"
                    checked={draft.acceptedQualityDisclaimer}
                    disabled={user?.talentApplicationStatus === 'submitted'}
                    onChange={(e) => setDraft((prev) => ({ ...prev, acceptedQualityDisclaimer: e.target.checked }))}
                  />
                  I understand and agree to upload quality requirements.
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                {user?.talentApplicationStatus === 'rejected' && (
                  <Button type="button" variant="outline" size="md" onClick={resetTalentApplicationForResubmit}>
                    Revise application
                  </Button>
                )}
                {user?.talentApplicationStatus !== 'submitted' && (
                  <>
                    <Button type="button" variant="outline" size="md" onClick={onSaveDraft}>
                      Save draft
                    </Button>
                    <Button type="button" variant="dark" size="md" onClick={onSubmitApplication} disabled={!requiredReady}>
                      Submit for review
                    </Button>
                  </>
                )}
              </div>

              {user?.talentApplicationStatus === 'submitted' && (
                <div className="rounded-xl border border-ink-10 bg-white p-4">
                  <p className="text-[12px] font-semibold text-ink-60">Admin review simulation (mock)</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button type="button" variant="dark" size="md" onClick={() => reviewTalentApplication('approved')}>
                      Simulate approve
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={() =>
                        reviewTalentApplication('rejected', 'Please provide clearer performance media and complete contact details.')
                      }
                    >
                      Simulate reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
            </div>

            <div className="mt-10 rounded-2xl border border-ink-10 p-6">
          <h2 className="text-lg font-extrabold text-ink">Other role applications</h2>
          <p className="mt-2 text-[14px] text-ink-60">
            Vendor and Organizer onboarding submitted from registration appears here for mock review simulation.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {renderRoleCard(
              'vendor',
              'Vendor onboarding',
              user?.vendorOnboarding?.status ?? 'not_started',
              user?.vendorOnboarding?.rejectionReason
            )}
            {renderRoleCard(
              'organizer',
              'Organizer onboarding',
              user?.organizerOnboarding?.status ?? 'not_started',
              user?.organizerOnboarding?.rejectionReason
            )}
          </div>
            </div>
          </>
        )}

        {activeTab === 'danger' && (
          <>
            <div className="mt-10 rounded-2xl border border-red-200 bg-red-50/50 p-6">
              <h2 className="text-lg font-extrabold text-red-900">Delete account</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-red-900/80">
                Permanent data loss; valid tickets auto-listed for auction per Terms. Irreversible.
              </p>
              <Button variant="danger" size="md" className="mt-4" type="button" onClick={() => setDeleteOpen(true)}>
                Delete account
              </Button>
            </div>

            <p className="mt-10">
              <button
                type="button"
                onClick={() => signOut()}
                className="text-[14px] font-semibold text-coral hover:underline"
              >
                Sign out
              </button>
            </p>
          </>
        )}
      </div>

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" role="dialog">
          <div className="max-w-md rounded-2xl bg-white p-6 shadow-card-lg">
            <h3 className="text-lg font-extrabold text-ink">Confirm deletion</h3>
            <p className="mt-2 text-[14px] text-ink-60">
              This is a demo — no data will be removed. In production, valid tickets would be listed for resale and
              your account wiped per policy.
            </p>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" size="md" className="flex-1" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                className="flex-1"
                onClick={() => {
                  void queueTicketsForAccountDeletionMock().then(() => {
                    pushNotification({
                      title: 'Tickets listed (demo)',
                      body: 'Your active tickets were added to the auction area as resale listings.',
                      kind: 'general',
                      href: '/auction',
                    });
                    setDeleteOpen(false);
                    signOut();
                  });
                }}
              >
                Confirm (demo)
              </Button>
            </div>
            <p className="mt-4 text-center text-[12px]">
              <Link to="/terms" className="text-coral underline">
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

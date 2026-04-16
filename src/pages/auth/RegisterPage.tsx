import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Buildings, MicrophoneStage, Storefront, User } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { SharedBasicStep } from '@/components/auth/steps/SharedBasicStep';
import { TalentSteps } from '@/components/auth/steps/TalentSteps';
import { VendorSteps } from '@/components/auth/steps/VendorSteps';
import { OrganizerSteps } from '@/components/auth/steps/OrganizerSteps';
import { OnboardingHeader } from '@/components/auth/OnboardingHeader';
import { FormSectionCard } from '@/components/ui/form/FormSectionCard';
import { InlineNotice } from '@/components/ui/form/InlineNotice';
import type {
  BaseRegistrationFields,
  OrganizerOnboardingDraft,
  TalentOnboardingDraft,
  VendorOnboardingDraft,
} from '@/types/domain';
import {
  isBasicValid,
  isOrganizerDraftReady,
  isTalentDraftReady,
  isVendorDraftReady,
  TALENT_BIO_MAX_CHARS,
  TALENT_BIO_MIN_CHARS,
  VENDOR_BIO_MIN_CHARS,
} from '@/lib/onboardingValidation';
import { isValidSaudiCity } from '@/lib/saudiLocations';
import { getSafeRedirectPath } from '@/lib/navigation';
import { cn } from '@/lib/utils';

type RegisterRole = 'guest' | 'talent' | 'organizer' | 'vendor';
type RegisterStage = 'basic' | 'role-selection' | 'onboarding';

interface RoleCard {
  id: RegisterRole;
  label: string;
  responsibility: string;
  helper: string;
  icon: Icon;
  surface: string;
  iconTone: string;
}

const ROLE_CARDS: RoleCard[] = [
  {
    id: 'guest',
    label: 'Guest',
    responsibility: 'Browse events and book tickets quickly.',
    helper: 'Fast path, no onboarding required.',
    icon: User,
    surface: 'bg-lemon/30 border-lemon/50',
    iconTone: 'bg-lemon text-ink',
  },
  {
    id: 'talent',
    label: 'Talent',
    responsibility: 'Showcase your profile and accept event engagements.',
    helper: 'For performers, artists, and speakers.',
    icon: MicrophoneStage,
    surface: 'bg-coral/10 border-coral/40',
    iconTone: 'bg-coral text-white',
  },
  {
    id: 'organizer',
    label: 'Organizer',
    responsibility: 'Create experiences and coordinate event operations.',
    helper: 'For event owners and production leads.',
    icon: Buildings,
    surface: 'bg-sky/15 border-sky/40',
    iconTone: 'bg-sky text-ink',
  },
  {
    id: 'vendor',
    label: 'Vendor',
    responsibility: 'Provide services like staging, lighting, and logistics.',
    helper: 'For suppliers and event service providers.',
    icon: Storefront,
    surface: 'bg-mint/20 border-mint/50',
    iconTone: 'bg-mint text-ink',
  },
];

export function RegisterPage() {
  const { signUp, signInGoogle, signUpWithRole, saveRoleOnboardingDraft, submitRoleOnboarding } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectAfterAuth =
    getSafeRedirectPath((location.state as { from?: { pathname: string } } | null)?.from?.pathname) ?? null;
  const [stage, setStage] = useState<RegisterStage>('basic');
  const [role, setRole] = useState<RegisterRole>('guest');
  const [wizardStep, setWizardStep] = useState(0);
  const [basic, setBasic] = useState<BaseRegistrationFields>({
    fullName: '',
    email: '',
    password: '',
    contactPhone: '',
    agreeTerms: false,
  });
  const [talentDraft, setTalentDraft] = useState<TalentOnboardingDraft>({
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
  });
  const [vendorDraft, setVendorDraft] = useState<VendorOnboardingDraft>({
    profileName: '',
    contactEmail: '',
    contactPhone: '',
    bio: '',
    serviceCategories: [],
    verificationDocuments: [],
    gallery: [],
    city: '',
    coverageArea: '',
  });
  const [organizerDraft, setOrganizerDraft] = useState<OrganizerOnboardingDraft>({
    displayName: '',
    profileImage: '',
    bio: '',
    email: '',
    contactPhone: '',
    location: '',
    socialLinks: [],
    optionalDocument: '',
    isCompany: false,
    companyName: '',
    companyInfo: '',
    ownerName: '',
    ownerInfo: '',
  });
  const [talentMediaInput, setTalentMediaInput] = useState('');
  const [vendorTempInput, setVendorTempInput] = useState('');
  const [organizerSocialInput, setOrganizerSocialInput] = useState('');
  const [loading, setLoading] = useState(false);

  const steps = useMemo(() => {
    if (role === 'talent') return ['Talent profile', 'Verification', 'Preferences'];
    if (role === 'vendor') return ['Vendor profile', 'Services', 'Compliance'];
    return ['Public profile', 'Contacts', 'Entity details', 'Social'];
  }, [role]);

  const onboardingTitle = useMemo(() => {
    if (role === 'talent') return 'Talent onboarding';
    if (role === 'vendor') return 'Vendor onboarding';
    if (role === 'organizer') return 'Organizer onboarding';
    return 'Create your account';
  }, [role]);

  const isCurrentRoleStepValid = useMemo(() => {
    if (role === 'talent') {
      if (wizardStep === 0) {
        const len = talentDraft.bio.trim().length;
        return len >= TALENT_BIO_MIN_CHARS && len <= TALENT_BIO_MAX_CHARS;
      }
      if (wizardStep === 1) return talentDraft.verificationMedia.length > 0;
      if (wizardStep === 2) {
        return (
          Boolean(talentDraft.saudiRegionId) &&
          Boolean(talentDraft.city.trim()) &&
          isValidSaudiCity(talentDraft.saudiRegionId, talentDraft.city.trim()) &&
          talentDraft.acceptedQualityDisclaimer
        );
      }
      return isTalentDraftReady(talentDraft);
    }
    if (role === 'vendor') {
      if (wizardStep === 0) {
        const len = vendorDraft.bio.trim().length;
        return vendorDraft.profileName.trim().length >= 2 && len >= VENDOR_BIO_MIN_CHARS && len <= TALENT_BIO_MAX_CHARS;
      }
      if (wizardStep === 1) return vendorDraft.serviceCategories.length > 0;
      if (wizardStep === 2) return vendorDraft.verificationDocuments.length > 0;
      return isVendorDraftReady(vendorDraft);
    }
    if (role === 'organizer') {
      if (wizardStep === 0) {
        const len = organizerDraft.bio.trim().length;
        return organizerDraft.displayName.trim().length >= 2 && len >= TALENT_BIO_MIN_CHARS && len <= TALENT_BIO_MAX_CHARS;
      }
      if (wizardStep === 1) {
        return organizerDraft.email.includes('@') && organizerDraft.location.trim().length >= 2;
      }
      if (wizardStep === 2) {
        const ownerValid = organizerDraft.ownerName.trim().length >= 2 && organizerDraft.ownerInfo.trim().length >= 10;
        if (!organizerDraft.isCompany) return ownerValid;
        return (
          ownerValid &&
          (organizerDraft.companyName?.trim().length ?? 0) >= 2 &&
          (organizerDraft.companyInfo?.trim().length ?? 0) >= 10
        );
      }
      return isOrganizerDraftReady(organizerDraft);
    }
    return false;
  }, [organizerDraft, role, talentDraft, vendorDraft, wizardStep]);

  async function continueAsGuest() {
    setLoading(true);
    try {
      await signUp(basic.fullName, basic.email, basic.password);
      navigate(redirectAfterAuth ?? '/');
    } finally {
      setLoading(false);
    }
  }

  async function continueWithGoogle() {
    setLoading(true);
    try {
      await signInGoogle();
      setBasic((prev) => ({
        ...prev,
        fullName: prev.fullName || 'Google User',
        email: prev.email || 'google.user@example.com',
        agreeTerms: true,
      }));
      setStage('role-selection');
    } finally {
      setLoading(false);
    }
  }

  function handleBasicSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isBasicValid(basic)) return;
    setStage('role-selection');
  }

  function selectRole(nextRole: RegisterRole) {
    setRole(nextRole);
    if (nextRole === 'guest') return;
    if (nextRole === 'talent') {
      setTalentDraft((prev) => ({
        ...prev,
        fullName: prev.fullName || basic.fullName,
        contactEmail: prev.contactEmail || basic.email,
        contactPhone: prev.contactPhone || basic.contactPhone,
      }));
    }
    if (nextRole === 'vendor') {
      setVendorDraft((prev) => ({
        ...prev,
        profileName: prev.profileName || basic.fullName,
        contactEmail: prev.contactEmail || basic.email,
        contactPhone: prev.contactPhone || basic.contactPhone,
      }));
    }
    if (nextRole === 'organizer') {
      setOrganizerDraft((prev) => ({
        ...prev,
        displayName: prev.displayName || basic.fullName,
        email: prev.email || basic.email,
        contactPhone: prev.contactPhone || basic.contactPhone,
        ownerName: prev.ownerName || basic.fullName,
      }));
    }
    setWizardStep(0);
    setStage('onboarding');
  }

  async function submitRoleOnboardingFlow(e: React.FormEvent) {
    e.preventDefault();
    if (!isCurrentRoleStepValid) return;
    if (role === 'guest') return;
    setLoading(true);
    try {
      await signUpWithRole(role, basic.fullName, basic.email, basic.password);
      if (role === 'talent') {
        saveRoleOnboardingDraft('talent', {
          ...talentDraft,
          fullName: basic.fullName,
          contactEmail: basic.email,
          contactPhone: basic.contactPhone,
        });
        submitRoleOnboarding('talent');
      }
      if (role === 'vendor') {
        saveRoleOnboardingDraft('vendor', {
          ...vendorDraft,
          profileName: vendorDraft.profileName || basic.fullName,
          contactEmail: basic.email,
          contactPhone: basic.contactPhone,
        });
        submitRoleOnboarding('vendor');
      }
      if (role === 'organizer') {
        saveRoleOnboardingDraft('organizer', {
          ...organizerDraft,
          displayName: organizerDraft.displayName || basic.fullName,
          email: basic.email,
          contactPhone: basic.contactPhone,
        });
        submitRoleOnboarding('organizer');
      }
      navigate(redirectAfterAuth ?? '/profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {stage === 'basic' && (
        <FormSectionCard
          eyebrow="Create account"
          title="Start with your details"
          description="Create your MyTicket account, then choose how you’ll use the platform."
        >
          <p className="-mt-4 text-[14px] text-ink-60">
            Already have an account?{' '}
            <Link to="/login" state={location.state} className="font-semibold text-coral hover:underline">
              Sign in
            </Link>
          </p>
          <form onSubmit={handleBasicSubmit} className="mt-6 space-y-4">
            <SharedBasicStep value={basic} onChange={(patch) => setBasic((prev) => ({ ...prev, ...patch }))} />
            <InlineNotice
              variant="info"
              title="Terms"
            >
              <p className="text-[12px] text-ink-60">
                By registering you agree to the{' '}
                <Link to="/terms" className="font-semibold text-coral underline">
                  Terms of Service
                </Link>
                .
              </p>
            </InlineNotice>
            <Button type="submit" variant="dark" size="md" className="w-full" disabled={!isBasicValid(basic)}>
              Continue
            </Button>
            <div className="relative py-2">
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
              onClick={continueWithGoogle}
              disabled={loading}
            >
              Continue with Google
            </Button>
          </form>
        </FormSectionCard>
      )}

      {stage === 'role-selection' && (
        <FormSectionCard
          eyebrow="Onboarding"
          title="Choose your role"
          description="Pick one role to continue. You can also skip onboarding and continue as Guest."
        >

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ROLE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => selectRole(card.id)}
                  className={cn(
                    'min-h-[178px] rounded-2xl border p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink',
                    card.surface
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[16px] font-extrabold leading-tight text-ink">{card.label}</p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-50">{card.helper}</p>
                    </div>
                    <span className={cn('inline-flex h-10 w-10 items-center justify-center rounded-xl', card.iconTone)}>
                      <Icon size={22} weight="fill" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-[13px] leading-relaxed text-ink-70">{card.responsibility}</p>
                    <p className="mt-3 text-[12px] font-bold text-coral">Select role</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex gap-2">
            <Button type="button" variant="outline" size="md" className="flex-1" onClick={() => setStage('basic')}>
              Back
            </Button>
            <Button
              type="button"
              variant="dark"
              size="md"
              className="flex-1"
              loading={loading}
              onClick={continueAsGuest}
            >
              Continue as Guest
            </Button>
          </div>
        </FormSectionCard>
      )}

      {stage === 'onboarding' && role !== 'guest' && (
        <FormSectionCard
          eyebrow="Onboarding"
          title={onboardingTitle}
          description="Complete the steps below. You can go back at any time."
          className="overflow-hidden p-6"
        >
          <OnboardingHeader
            title={steps[wizardStep] ?? 'Onboarding'}
            description={role === 'organizer' ? 'Build your public organizer profile (demo).' : undefined}
            steps={steps}
            activeIdx={wizardStep}
          />
          <form onSubmit={submitRoleOnboardingFlow} className="space-y-4">

          {role === 'talent' && (
            <TalentSteps
              step={wizardStep}
              draft={talentDraft}
              mediaInput={talentMediaInput}
              setMediaInput={setTalentMediaInput}
              onChange={(patch) => setTalentDraft((prev) => ({ ...prev, ...patch }))}
            />
          )}
          {role === 'vendor' && (
            <VendorSteps
              step={wizardStep}
              draft={vendorDraft}
              tempInput={vendorTempInput}
              setTempInput={setVendorTempInput}
              onChange={(patch) => setVendorDraft((prev) => ({ ...prev, ...patch }))}
            />
          )}
          {role === 'organizer' && (
            <OrganizerSteps
              step={wizardStep}
              draft={organizerDraft}
              socialInput={organizerSocialInput}
              setSocialInput={setOrganizerSocialInput}
              onChange={(patch) => setOrganizerDraft((prev) => ({ ...prev, ...patch }))}
            />
          )}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="w-full sm:flex-1"
              onClick={() => {
                if (wizardStep === 0) {
                  setStage('role-selection');
                  return;
                }
                setWizardStep((s) => Math.max(0, s - 1));
              }}
            >
              Back
            </Button>
            {wizardStep < steps.length - 1 ? (
              <Button
                type="button"
                variant="dark"
                size="md"
                className="w-full sm:flex-1"
                disabled={!isCurrentRoleStepValid}
                onClick={() => setWizardStep((s) => Math.min(steps.length - 1, s + 1))}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="dark"
                size="md"
                className="w-full sm:flex-1"
                loading={loading}
                disabled={!isCurrentRoleStepValid}
              >
                Submit {role} application
              </Button>
            )}
          </div>
          </form>
        </FormSectionCard>
      )}
    </div>
  );
}

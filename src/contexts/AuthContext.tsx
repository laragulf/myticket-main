import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type {
  OnboardingRole,
  OrganizerOnboardingDraft,
  RoleOnboardingRecord,
  RoleOnboardingStatus,
  TalentApplicationStatus,
  TalentOnboardingDraft,
  UserRole,
  VendorOnboardingDraft,
} from '@/types/domain';

export type MockUser = {
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  city: string;
  region: string;
  bio: string;
  profileImage: string;
  preferences: {
    language: 'en' | 'ar';
    theme: 'system' | 'light' | 'dark';
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChangedAt: string;
  };
  talentApplicationStatus: TalentApplicationStatus;
  talentDraft?: TalentOnboardingDraft;
  talentSubmittedAt?: string;
  talentRejectedReason?: string;
  vendorOnboarding?: RoleOnboardingRecord<VendorOnboardingDraft>;
  organizerOnboarding?: RoleOnboardingRecord<OrganizerOnboardingDraft>;
};

const STORAGE_KEY = 'myticket_mock_auth';
const DEFAULT_TALENT_DRAFT: TalentOnboardingDraft = {
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
const DEFAULT_VENDOR_DRAFT: VendorOnboardingDraft = {
  profileName: '',
  contactEmail: '',
  contactPhone: '',
  bio: '',
  serviceCategories: [],
  verificationDocuments: [],
  gallery: [],
  city: '',
  coverageArea: '',
};
const DEFAULT_ORGANIZER_DRAFT: OrganizerOnboardingDraft = {
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
};

type RoleDraftMap = {
  talent: TalentOnboardingDraft;
  vendor: VendorOnboardingDraft;
  organizer: OrganizerOnboardingDraft;
};

function normalizeUser(input: Partial<MockUser> | null): MockUser | null {
  if (!input?.email || !input?.name) return null;
  return {
    email: input.email,
    name: input.name,
    role: input.role ?? 'guest',
    phone: input.phone ?? '',
    city: input.city ?? '',
    region: input.region ?? '',
    bio: input.bio ?? '',
    profileImage: input.profileImage ?? '',
    preferences: {
      language: input.preferences?.language ?? 'en',
      theme: input.preferences?.theme ?? 'system',
      emailNotifications: input.preferences?.emailNotifications ?? true,
      pushNotifications: input.preferences?.pushNotifications ?? true,
      smsNotifications: input.preferences?.smsNotifications ?? false,
      marketingEmails: input.preferences?.marketingEmails ?? false,
    },
    security: {
      twoFactorEnabled: input.security?.twoFactorEnabled ?? false,
      lastPasswordChangedAt: input.security?.lastPasswordChangedAt ?? new Date().toISOString(),
    },
    talentApplicationStatus: input.talentApplicationStatus ?? 'not_started',
    talentDraft: {
      ...DEFAULT_TALENT_DRAFT,
      ...(input.talentDraft ?? {}),
      fullName: input.talentDraft?.fullName ?? input.name,
      contactEmail: input.talentDraft?.contactEmail ?? input.email,
    },
    talentSubmittedAt: input.talentSubmittedAt,
    talentRejectedReason: input.talentRejectedReason,
    vendorOnboarding:
      input.vendorOnboarding ??
      ({
        status: 'not_started',
        draft: { ...DEFAULT_VENDOR_DRAFT, profileName: input.name, contactEmail: input.email },
      } as RoleOnboardingRecord<VendorOnboardingDraft>),
    organizerOnboarding:
      input.organizerOnboarding ??
      ({
        status: 'not_started',
        draft: {
          ...DEFAULT_ORGANIZER_DRAFT,
          displayName: input.name,
          email: input.email,
          ownerName: input.name,
        },
      } as RoleOnboardingRecord<OrganizerOnboardingDraft>),
  };
}

function readUser(): MockUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const u = JSON.parse(raw) as Partial<MockUser>;
    return normalizeUser(u);
  } catch {
    return null;
  }
}

function writeUser(u: MockUser | null) {
  if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  else localStorage.removeItem(STORAGE_KEY);
}

export function getStoredUser(): MockUser | null {
  return readUser();
}

type AuthContextValue = {
  user: MockUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signUpWithRole: (role: OnboardingRole, name: string, email: string, password: string) => Promise<void>;
  updateProfileName: (name: string) => void;
  updateAccountInfo: (
    patch: Partial<Pick<MockUser, 'name' | 'email' | 'phone' | 'city' | 'region' | 'bio' | 'profileImage'>>
  ) => void;
  updatePreferences: (patch: Partial<MockUser['preferences']>) => void;
  updateSecuritySettings: (patch: Partial<MockUser['security']>) => void;
  changePasswordMock: () => void;
  saveRoleOnboardingDraft: <TRole extends OnboardingRole>(role: TRole, patch: Partial<RoleDraftMap[TRole]>) => void;
  submitRoleOnboarding: (role: OnboardingRole) => void;
  reviewRoleOnboarding: (role: OnboardingRole, decision: 'approved' | 'rejected', reason?: string) => void;
  resetRoleOnboardingForResubmit: (role: OnboardingRole) => void;
  saveTalentDraft: (patch: Partial<TalentOnboardingDraft>) => void;
  submitTalentApplication: () => void;
  reviewTalentApplication: (decision: 'approved' | 'rejected', reason?: string) => void;
  resetTalentApplicationForResubmit: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(() => readUser());

  const signIn = useCallback(async (email: string, _password: string) => {
    const part = email.split('@')[0] ?? 'guest';
    const name = part.charAt(0).toUpperCase() + part.slice(1);
    const u = normalizeUser({ email, name });
    if (!u) return;
    writeUser(u);
    setUser(u);
  }, []);

  const signInGoogle = useCallback(async () => {
    const u = normalizeUser({ email: 'google.user@example.com', name: 'Google User' });
    if (!u) return;
    writeUser(u);
    setUser(u);
  }, []);

  const signUp = useCallback(async (name: string, email: string, _password: string) => {
    const u = normalizeUser({
      email,
      name: name.trim() || (email.split('@')[0] ?? 'User'),
    });
    if (!u) return;
    writeUser(u);
    setUser(u);
  }, []);

  const signUpWithRole = useCallback(
    async (role: OnboardingRole, name: string, email: string, password: string) => {
      await signUp(name, email, password);
      setUser((prev) => {
        if (!prev) return prev;
        if (role === 'talent') {
          const next = {
            ...prev,
            talentApplicationStatus: 'draft' as TalentApplicationStatus,
          };
          writeUser(next);
          return next;
        }
        if (role === 'vendor') {
          const next = {
            ...prev,
            vendorOnboarding: {
              ...(prev.vendorOnboarding ?? { status: 'not_started', draft: DEFAULT_VENDOR_DRAFT }),
              status: 'draft' as RoleOnboardingStatus,
            },
          };
          writeUser(next);
          return next;
        }
        const next = {
          ...prev,
          organizerOnboarding: {
            ...(prev.organizerOnboarding ?? { status: 'not_started', draft: DEFAULT_ORGANIZER_DRAFT }),
            status: 'draft' as RoleOnboardingStatus,
          },
        };
        writeUser(next);
        return next;
      });
    },
    [signUp]
  );

  const updateProfileName = useCallback((name: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        name: name.trim() || prev.name,
        talentDraft: {
          ...(prev.talentDraft ?? DEFAULT_TALENT_DRAFT),
          fullName: name.trim() || prev.name,
        },
      };
      writeUser(next);
      return next;
    });
  }, []);

  const updateAccountInfo = useCallback(
    (
      patch: Partial<Pick<MockUser, 'name' | 'email' | 'phone' | 'city' | 'region' | 'bio' | 'profileImage'>>
    ) => {
      setUser((prev) => {
        if (!prev) return prev;
        const nextName = patch.name?.trim() || prev.name;
        const nextEmail = patch.email?.trim() || prev.email;
        const next: MockUser = {
          ...prev,
          name: nextName,
          email: nextEmail,
          phone: patch.phone ?? prev.phone,
          city: patch.city ?? prev.city,
          region: patch.region ?? prev.region,
          bio: patch.bio ?? prev.bio,
          profileImage: patch.profileImage ?? prev.profileImage,
          talentDraft: {
            ...(prev.talentDraft ?? DEFAULT_TALENT_DRAFT),
            fullName: nextName,
            contactEmail: nextEmail,
            contactPhone: (patch.phone ?? prev.phone) || prev.talentDraft?.contactPhone || '',
          },
          vendorOnboarding: prev.vendorOnboarding
            ? {
                ...prev.vendorOnboarding,
                draft: {
                  ...prev.vendorOnboarding.draft,
                  contactEmail: nextEmail,
                },
              }
            : prev.vendorOnboarding,
          organizerOnboarding: prev.organizerOnboarding
            ? {
                ...prev.organizerOnboarding,
                draft: {
                  ...prev.organizerOnboarding.draft,
                  email: nextEmail,
                },
              }
            : prev.organizerOnboarding,
        };
        writeUser(next);
        return next;
      });
    },
    []
  );

  const updatePreferences = useCallback((patch: Partial<MockUser['preferences']>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next: MockUser = {
        ...prev,
        preferences: { ...prev.preferences, ...patch },
      };
      writeUser(next);
      return next;
    });
  }, []);

  const updateSecuritySettings = useCallback((patch: Partial<MockUser['security']>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next: MockUser = {
        ...prev,
        security: { ...prev.security, ...patch },
      };
      writeUser(next);
      return next;
    });
  }, []);

  const changePasswordMock = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const next: MockUser = {
        ...prev,
        security: { ...prev.security, lastPasswordChangedAt: new Date().toISOString() },
      };
      writeUser(next);
      return next;
    });
  }, []);

  const saveTalentDraft = useCallback((patch: Partial<TalentOnboardingDraft>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextStatus: TalentApplicationStatus =
        prev.talentApplicationStatus === 'not_started' || prev.talentApplicationStatus === 'rejected'
          ? 'draft'
          : prev.talentApplicationStatus;
      const next: MockUser = {
        ...prev,
        talentApplicationStatus: nextStatus,
        talentDraft: {
          ...(prev.talentDraft ?? {
            ...DEFAULT_TALENT_DRAFT,
            fullName: prev.name,
            contactEmail: prev.email,
          }),
          ...patch,
        },
      };
      writeUser(next);
      return next;
    });
  }, []);

  const saveRoleOnboardingDraft = useCallback(
    <TRole extends OnboardingRole>(role: TRole, patch: Partial<RoleDraftMap[TRole]>) => {
      if (role === 'talent') {
        saveTalentDraft(patch as Partial<TalentOnboardingDraft>);
        return;
      }
      setUser((prev) => {
        if (!prev) return prev;
        if (role === 'vendor') {
          const next: MockUser = {
            ...prev,
            vendorOnboarding: {
              status:
                prev.vendorOnboarding?.status === 'not_started' || prev.vendorOnboarding?.status === 'rejected'
                  ? 'draft'
                  : (prev.vendorOnboarding?.status ?? 'draft'),
              draft: {
                ...(prev.vendorOnboarding?.draft ?? {
                  ...DEFAULT_VENDOR_DRAFT,
                  profileName: prev.name,
                  contactEmail: prev.email,
                }),
                ...(patch as Partial<VendorOnboardingDraft>),
              },
              submittedAt: prev.vendorOnboarding?.submittedAt,
              rejectionReason: prev.vendorOnboarding?.rejectionReason,
            },
          };
          writeUser(next);
          return next;
        }
        const next: MockUser = {
          ...prev,
          organizerOnboarding: {
            status:
              prev.organizerOnboarding?.status === 'not_started' || prev.organizerOnboarding?.status === 'rejected'
                ? 'draft'
                : (prev.organizerOnboarding?.status ?? 'draft'),
            draft: {
              ...(prev.organizerOnboarding?.draft ?? {
                ...DEFAULT_ORGANIZER_DRAFT,
                displayName: prev.name,
                email: prev.email,
                ownerName: prev.name,
              }),
              ...(patch as Partial<OrganizerOnboardingDraft>),
            },
            submittedAt: prev.organizerOnboarding?.submittedAt,
            rejectionReason: prev.organizerOnboarding?.rejectionReason,
          },
        };
        writeUser(next);
        return next;
      });
    },
    [saveTalentDraft]
  );

  const submitTalentApplication = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const next: MockUser = {
        ...prev,
        talentApplicationStatus: 'submitted',
        talentSubmittedAt: new Date().toISOString(),
        talentRejectedReason: undefined,
      };
      writeUser(next);
      return next;
    });
  }, []);

  const reviewTalentApplication = useCallback((decision: 'approved' | 'rejected', reason?: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next: MockUser = {
        ...prev,
        role: decision === 'approved' ? 'talent' : 'guest',
        talentApplicationStatus: decision,
        talentRejectedReason: decision === 'rejected' ? reason || 'Profile details need clearer verification media.' : undefined,
      };
      writeUser(next);
      return next;
    });
  }, []);

  const submitRoleOnboarding = useCallback(
    (role: OnboardingRole) => {
      if (role === 'talent') {
        submitTalentApplication();
        return;
      }
      setUser((prev) => {
        if (!prev) return prev;
        const now = new Date().toISOString();
        if (role === 'vendor') {
          const next = {
            ...prev,
            vendorOnboarding: {
              ...(prev.vendorOnboarding ?? { status: 'draft', draft: DEFAULT_VENDOR_DRAFT }),
              status: 'submitted' as RoleOnboardingStatus,
              submittedAt: now,
              rejectionReason: undefined,
            },
          };
          writeUser(next);
          return next;
        }
        const next = {
          ...prev,
          organizerOnboarding: {
            ...(prev.organizerOnboarding ?? { status: 'draft', draft: DEFAULT_ORGANIZER_DRAFT }),
            status: 'submitted' as RoleOnboardingStatus,
            submittedAt: now,
            rejectionReason: undefined,
          },
        };
        writeUser(next);
        return next;
      });
    },
    [submitTalentApplication]
  );

  const reviewRoleOnboarding = useCallback(
    (role: OnboardingRole, decision: 'approved' | 'rejected', reason?: string) => {
      if (role === 'talent') {
        reviewTalentApplication(decision, reason);
        return;
      }
      setUser((prev) => {
        if (!prev) return prev;
        const nextRole: UserRole = decision === 'approved' ? role : 'guest';
        if (role === 'vendor') {
          const next = {
            ...prev,
            role: nextRole,
            vendorOnboarding: {
              ...(prev.vendorOnboarding ?? { status: 'submitted', draft: DEFAULT_VENDOR_DRAFT }),
              status: decision as RoleOnboardingStatus,
              rejectionReason:
                decision === 'rejected'
                  ? reason || 'Please complete verification documents and service categories.'
                  : undefined,
            },
          };
          writeUser(next);
          return next;
        }
        const next = {
          ...prev,
          role: nextRole,
          organizerOnboarding: {
            ...(prev.organizerOnboarding ?? { status: 'submitted', draft: DEFAULT_ORGANIZER_DRAFT }),
            status: decision as RoleOnboardingStatus,
            rejectionReason:
              decision === 'rejected'
                ? reason || 'Please complete organizer profile details and owner/company information.'
                : undefined,
          },
        };
        writeUser(next);
        return next;
      });
    },
    [reviewTalentApplication]
  );

  const resetTalentApplicationForResubmit = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const next: MockUser = {
        ...prev,
        talentApplicationStatus: 'draft',
        talentRejectedReason: undefined,
      };
      writeUser(next);
      return next;
    });
  }, []);

  const resetRoleOnboardingForResubmit = useCallback(
    (role: OnboardingRole) => {
      if (role === 'talent') {
        resetTalentApplicationForResubmit();
        return;
      }
      setUser((prev) => {
        if (!prev) return prev;
        if (role === 'vendor') {
          const next = {
            ...prev,
            vendorOnboarding: {
              ...(prev.vendorOnboarding ?? { status: 'rejected', draft: DEFAULT_VENDOR_DRAFT }),
              status: 'draft' as RoleOnboardingStatus,
              rejectionReason: undefined,
            },
          };
          writeUser(next);
          return next;
        }
        const next = {
          ...prev,
          organizerOnboarding: {
            ...(prev.organizerOnboarding ?? { status: 'rejected', draft: DEFAULT_ORGANIZER_DRAFT }),
            status: 'draft' as RoleOnboardingStatus,
            rejectionReason: undefined,
          },
        };
        writeUser(next);
        return next;
      });
    },
    [resetTalentApplicationForResubmit]
  );

  const signOut = useCallback(() => {
    writeUser(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      signIn,
      signInGoogle,
      signUp,
      signUpWithRole,
      updateProfileName,
      updateAccountInfo,
      updatePreferences,
      updateSecuritySettings,
      changePasswordMock,
      saveRoleOnboardingDraft,
      submitRoleOnboarding,
      reviewRoleOnboarding,
      resetRoleOnboardingForResubmit,
      saveTalentDraft,
      submitTalentApplication,
      reviewTalentApplication,
      resetTalentApplicationForResubmit,
      signOut,
    }),
    [
      user,
      signIn,
      signInGoogle,
      signUp,
      signUpWithRole,
      updateProfileName,
      updateAccountInfo,
      updatePreferences,
      updateSecuritySettings,
      changePasswordMock,
      saveRoleOnboardingDraft,
      submitRoleOnboarding,
      reviewRoleOnboarding,
      resetRoleOnboardingForResubmit,
      saveTalentDraft,
      submitTalentApplication,
      reviewTalentApplication,
      resetTalentApplicationForResubmit,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

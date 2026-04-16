import { MOCK_ENGAGEMENTS_SEED } from '@/data/mockEngagements';
import type { EngagementStatus, MockEngagement, MockEngagementMessage, TalentAvailability } from '@/types/domain';

const PATCH_KEY = 'myticket_engagement_status';
const THREAD_PATCH_KEY = 'myticket_engagement_messages';
const TALENT_AVAILABILITY_KEY = 'myticket_talent_availability';
const EXTRA_ENGAGEMENTS_KEY = 'myticket_extra_engagements';

function readPatch(): Record<string, EngagementStatus> {
  try {
    const raw = sessionStorage.getItem(PATCH_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, EngagementStatus>;
  } catch {
    return {};
  }
}

function writePatch(p: Record<string, EngagementStatus>) {
  sessionStorage.setItem(PATCH_KEY, JSON.stringify(p));
}

function readMessagePatch(): Record<string, MockEngagementMessage[]> {
  try {
    const raw = sessionStorage.getItem(THREAD_PATCH_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, MockEngagementMessage[]>;
  } catch {
    return {};
  }
}

function writeMessagePatch(p: Record<string, MockEngagementMessage[]>) {
  sessionStorage.setItem(THREAD_PATCH_KEY, JSON.stringify(p));
}

function readAvailability(): TalentAvailability {
  try {
    const raw = localStorage.getItem(TALENT_AVAILABILITY_KEY);
    if (raw === 'reserved' || raw === 'available') return raw;
    return 'available';
  } catch {
    return 'available';
  }
}

function writeAvailability(next: TalentAvailability) {
  localStorage.setItem(TALENT_AVAILABILITY_KEY, next);
}

function readExtraEngagements(): MockEngagement[] {
  try {
    const raw = sessionStorage.getItem(EXTRA_ENGAGEMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MockEngagement[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeExtraEngagements(items: MockEngagement[]) {
  sessionStorage.setItem(EXTRA_ENGAGEMENTS_KEY, JSON.stringify(items));
}

export function getEngagements(): MockEngagement[] {
  const patch = readPatch();
  const messagePatch = readMessagePatch();
  const merged = [...readExtraEngagements(), ...MOCK_ENGAGEMENTS_SEED];
  return merged.map((e) => ({
    ...e,
    status: patch[e.id] ?? e.status,
    messages: messagePatch[e.id] ?? e.messages,
  }));
}

export function setEngagementStatus(id: string, status: EngagementStatus) {
  const patch = readPatch();
  patch[id] = status;
  writePatch(patch);
  if (status === 'accepted') {
    writeAvailability('reserved');
  }
}

export function getEngagementById(id: string): MockEngagement | undefined {
  return getEngagements().find((e) => e.id === id);
}

export function addEngagementMessage(engagementId: string, sender: MockEngagementMessage['sender'], text: string) {
  const cleaned = text.trim();
  if (!cleaned) return;
  const patch = readMessagePatch();
  const current = getEngagementById(engagementId);
  if (!current) return;
  const thread = patch[engagementId] ?? current.messages;
  thread.push({
    id: `${engagementId}-msg-${Date.now()}`,
    sender,
    text: cleaned,
    createdAt: new Date().toISOString(),
  });
  patch[engagementId] = thread;
  writeMessagePatch(patch);
}

export function createOrganizerEngagementMock(params: {
  targetName: string;
  targetKind: 'talent' | 'vendor';
  organizerName: string;
  organizerCity?: string;
}) {
  const { targetName, targetKind, organizerName, organizerCity } = params;
  const normalizedTarget = targetName.trim();
  if (!normalizedTarget) return null;
  const topicPrefix = targetKind === 'talent' ? 'Talent inquiry' : 'Vendor inquiry';
  const topic = `${topicPrefix}: ${normalizedTarget}`;
  const existing = getEngagements().find((e) => e.topic === topic);
  if (existing) return existing;

  const createdAt = new Date().toISOString();
  const created: MockEngagement = {
    id: `eng-org-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    organizerName,
    organizerId: `org-self-${organizerName.toLowerCase().replace(/\s+/g, '-')}`,
    topic,
    preview: `Conversation started with ${normalizedTarget}. Continue negotiation in this thread (demo).`,
    status: 'pending',
    createdAt,
    organizerProfile: {
      id: `org-self-${organizerName.toLowerCase().replace(/\s+/g, '-')}`,
      name: organizerName,
      bio: 'Organizer profile from main website. Full management is handled in organizer dashboard.',
      city: organizerCity?.trim() || 'Riyadh',
      organizerType: 'Event Organizer',
      recentEvents: ['Upcoming organizer portfolio in dashboard'],
    },
    messages: [
      {
        id: `m-${Date.now()}`,
        sender: 'organizer',
        text: `Hi ${normalizedTarget}, I would like to discuss a collaboration for an upcoming event.`,
        createdAt,
      },
    ],
  };
  const extra = readExtraEngagements();
  writeExtraEngagements([created, ...extra]);
  return created;
}

export function getTalentAvailability(): TalentAvailability {
  return readAvailability();
}

export function setTalentAvailability(status: TalentAvailability) {
  writeAvailability(status);
}

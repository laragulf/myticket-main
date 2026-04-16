import { MOCK_ENGAGEMENTS_SEED } from '@/data/mockEngagements';
import type { EngagementStatus, MockEngagement, MockEngagementMessage, TalentAvailability } from '@/types/domain';

const PATCH_KEY = 'myticket_engagement_status';
const THREAD_PATCH_KEY = 'myticket_engagement_messages';
const TALENT_AVAILABILITY_KEY = 'myticket_talent_availability';

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

export function getEngagements(): MockEngagement[] {
  const patch = readPatch();
  const messagePatch = readMessagePatch();
  return MOCK_ENGAGEMENTS_SEED.map((e) => ({
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

export function getTalentAvailability(): TalentAvailability {
  return readAvailability();
}

export function setTalentAvailability(status: TalentAvailability) {
  writeAvailability(status);
}

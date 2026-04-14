import { MOCK_ENGAGEMENTS_SEED } from '@/data/mockEngagements';
import type { EngagementStatus, MockEngagement } from '@/types/domain';

const PATCH_KEY = 'myticket_engagement_status';

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

export function getEngagements(): MockEngagement[] {
  const patch = readPatch();
  return MOCK_ENGAGEMENTS_SEED.map((e) => ({
    ...e,
    status: patch[e.id] ?? e.status,
  }));
}

export function setEngagementStatus(id: string, status: EngagementStatus) {
  const patch = readPatch();
  patch[id] = status;
  writePatch(patch);
}

export function getEngagementById(id: string): MockEngagement | undefined {
  return getEngagements().find((e) => e.id === id);
}

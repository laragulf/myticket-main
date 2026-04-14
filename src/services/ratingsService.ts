import type { MockEvent } from '@/types/domain';
import { getEventByIdSync } from '@/services/eventsService';

const KEY = 'myticket_event_ratings_v1';

type Store = {
  /** Per-event aggregate from user submissions only */
  sums: Record<string, number>;
  counts: Record<string, number>;
  /** key: `${email}::${eventId}` -> 1-5 */
  byUser: Record<string, number>;
  /** eventIds we've blended seed rating into aggregates */
  seeded: Record<string, boolean>;
};

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      return { sums: {}, counts: {}, byUser: {}, seeded: {} };
    }
    return JSON.parse(raw) as Store;
  } catch {
    return { sums: {}, counts: {}, byUser: {}, seeded: {} };
  }
}

function write(s: Store) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

function userKey(email: string, eventId: string) {
  return `${email.toLowerCase()}::${eventId}`;
}

function ensureSeed(event: MockEvent) {
  if (event.rating == null) return;
  const s = read();
  if (s.seeded[event.id]) return;
  const n = 12;
  s.sums[event.id] = (s.sums[event.id] ?? 0) + event.rating * n;
  s.counts[event.id] = (s.counts[event.id] ?? 0) + n;
  s.seeded[event.id] = true;
  write(s);
}

/** Display average and count (includes seed blend once per event). */
export function getDisplayRating(event: MockEvent): { average: number; count: number } {
  ensureSeed(event);
  const s = read();
  const sum = s.sums[event.id] ?? 0;
  const count = s.counts[event.id] ?? 0;
  if (count <= 0) return { average: 0, count: 0 };
  return { average: sum / count, count };
}

export function hasUserRated(userEmail: string, eventId: string): boolean {
  return read().byUser[userKey(userEmail, eventId)] != null;
}

export function submitRating(userEmail: string, eventId: string, stars: number): boolean {
  if (stars < 1 || stars > 5) return false;
  const ev = getEventByIdSync(eventId);
  if (ev) ensureSeed(ev);
  const key = userKey(userEmail, eventId);
  const s = read();
  if (s.byUser[key] != null) return false;
  s.byUser[key] = stars;
  s.sums[eventId] = (s.sums[eventId] ?? 0) + stars;
  s.counts[eventId] = (s.counts[eventId] ?? 0) + 1;
  write(s);
  return true;
}

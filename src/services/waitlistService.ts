const KEY = 'myticket_waitlist_event_ids';

export function getWaitlistedIds(): string[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isOnWaitlist(eventId: string): boolean {
  return getWaitlistedIds().includes(eventId);
}

export function joinWaitlist(eventId: string): boolean {
  const cur = getWaitlistedIds();
  if (cur.includes(eventId)) return false;
  sessionStorage.setItem(KEY, JSON.stringify([...cur, eventId]));
  return true;
}

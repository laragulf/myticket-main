import { MOCK_EVENTS } from '@/data/mockEvents';
import type { EventFilters, MockEvent } from '@/types/domain';

function delay<T>(value: T, ms = 180): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function matchesEvent(e: MockEvent, f: EventFilters): boolean {
  if (f.featured && !e.featured) return false;
  if (f.keyword) {
    const k = f.keyword.toLowerCase();
    const blob = `${e.title} ${e.excerpt} ${e.description} ${e.talents.map((t) => t.name).join(' ')}`.toLowerCase();
    if (!blob.includes(k)) return false;
  }
  if (f.category && f.category !== 'all' && e.category !== f.category) return false;
  if (f.city && f.city !== 'all' && e.city !== f.city) return false;
  if (f.dateFrom) {
    if (new Date(e.dateStart) < new Date(f.dateFrom)) return false;
  }
  if (f.dateTo) {
    if (new Date(e.dateStart) > new Date(f.dateTo + 'T23:59:59')) return false;
  }
  if (f.priceMin != null && e.priceMax < f.priceMin) return false;
  if (f.priceMax != null && e.priceMin > f.priceMax) return false;
  if (f.layoutType && f.layoutType !== 'all' && e.layoutType !== f.layoutType) return false;
  if (f.availabilityOnly && e.ticketsLeft <= 0) return false;
  return true;
}

export async function listEvents(filters: EventFilters = {}): Promise<MockEvent[]> {
  const out = MOCK_EVENTS.filter((e) => matchesEvent(e, filters));
  return delay(out);
}

export async function getEventById(id: string): Promise<MockEvent | null> {
  const e = MOCK_EVENTS.find((x) => x.id === id) ?? null;
  return delay(e);
}

export function getEventByIdSync(id: string): MockEvent | undefined {
  return MOCK_EVENTS.find((x) => x.id === id);
}

/** Categories for filter dropdown */
export const EVENT_CATEGORIES = ['Music', 'Comedy', 'Sports', 'Arts & Culture'] as const;

export const EVENT_CITIES = ['Riyadh', 'Jeddah', 'Khobar', 'Dubai'] as const;

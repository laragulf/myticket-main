import { MOCK_AUCTION_SEED } from '@/data/mockAuction';
import type { MockAuctionListing } from '@/types/domain';

const EXTRA_KEY = 'myticket_auction_listings_extra';
const REMOVED_KEY = 'myticket_auction_removed_ids';

function readExtra(): MockAuctionListing[] {
  try {
    const raw = sessionStorage.getItem(EXTRA_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MockAuctionListing[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeExtra(listings: MockAuctionListing[]) {
  sessionStorage.setItem(EXTRA_KEY, JSON.stringify(listings));
}

function readRemoved(): Set<string> {
  try {
    const raw = sessionStorage.getItem(REMOVED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeRemoved(ids: Set<string>) {
  sessionStorage.setItem(REMOVED_KEY, JSON.stringify([...ids]));
}

function mergedMap(): Map<string, MockAuctionListing> {
  const map = new Map<string, MockAuctionListing>();
  for (const l of MOCK_AUCTION_SEED) {
    map.set(l.id, l);
  }
  for (const l of readExtra()) {
    map.set(l.id, l);
  }
  return map;
}

/** Active resale listings (not removed, not past end time). */
export function getAllListings(): MockAuctionListing[] {
  const removed = readRemoved();
  const now = Date.now();
  return [...mergedMap().values()].filter(
    (l) => !removed.has(l.id) && new Date(l.endsAt).getTime() > now
  );
}

export function getListingsByEvent(eventId: string): MockAuctionListing[] {
  return getAllListings().filter((l) => l.eventId === eventId);
}

export function countListingsByEvent(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const l of getAllListings()) {
    counts[l.eventId] = (counts[l.eventId] ?? 0) + 1;
  }
  return counts;
}

export function nearestEndForEvent(eventId: string): string | null {
  const list = getListingsByEvent(eventId);
  if (!list.length) return null;
  return list.reduce((a, b) =>
    new Date(a.endsAt).getTime() < new Date(b.endsAt).getTime() ? a : b
  ).endsAt;
}

export function appendListing(listing: MockAuctionListing) {
  writeExtra([...readExtra(), listing]);
}

export function removeListingById(listingId: string) {
  const removed = readRemoved();
  removed.add(listingId);
  writeRemoved(removed);
  writeExtra(readExtra().filter((l) => l.id !== listingId));
}

import { MOCK_TALENTS, MOCK_VENDORS } from '@/data/mockMarketplace';
import type { MarketplaceTalent, MarketplaceVendor } from '@/types/domain';

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export async function listTalents(): Promise<MarketplaceTalent[]> {
  return delay([...MOCK_TALENTS]);
}

export async function listVendors(): Promise<MarketplaceVendor[]> {
  return delay([...MOCK_VENDORS]);
}

export async function getTalentById(id: string): Promise<MarketplaceTalent | null> {
  return delay(MOCK_TALENTS.find((t) => t.id === id) ?? null);
}

export async function getVendorById(id: string): Promise<MarketplaceVendor | null> {
  return delay(MOCK_VENDORS.find((v) => v.id === id) ?? null);
}

/** Resolve `/artists/:slug` from encoded name (e.g. Nour%20Khalil) or slug string. */
export async function findTalentByArtistParam(param: string): Promise<MarketplaceTalent | null> {
  const decoded = decodeURIComponent(param).trim();
  const bySlug = MOCK_TALENTS.find((t) => t.slug === param || t.slug === slugify(decoded));
  if (bySlug) return delay(bySlug);
  const byName = MOCK_TALENTS.find((t) => t.name.toLowerCase() === decoded.toLowerCase());
  return delay(byName ?? null);
}

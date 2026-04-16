import { MOCK_USER_TICKETS_SEED } from '@/data/mockTickets';
import { appendListing, removeListingById } from '@/services/auctionService';
import { getEventByIdSync } from '@/services/eventsService';
import type { MockAuctionListing, MockTicket } from '@/types/domain';

const STORAGE_KEY = 'myticket_mock_extra_tickets';
const PATCH_KEY = 'myticket_ticket_patch';

function readExtra(): MockTicket[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MockTicket[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeExtra(tickets: MockTicket[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

function readPatch(): Record<string, Partial<MockTicket>> {
  try {
    const raw = sessionStorage.getItem(PATCH_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, Partial<MockTicket>>;
  } catch {
    return {};
  }
}

function writePatch(p: Record<string, Partial<MockTicket>>) {
  sessionStorage.setItem(PATCH_KEY, JSON.stringify(p));
}

function applyPatch(t: MockTicket): MockTicket {
  const p = readPatch()[t.id];
  return p ? { ...t, ...p } : t;
}

export function patchTicket(ticketId: string, partial: Partial<MockTicket>) {
  const cur = readPatch();
  cur[ticketId] = { ...cur[ticketId], ...partial };
  writePatch(cur);
}

export function appendTicketsFromCheckout(newTickets: MockTicket[]) {
  const cur = readExtra();
  writeExtra([...cur, ...newTickets]);
}

export async function getMyTickets(): Promise<MockTicket[]> {
  return [...MOCK_USER_TICKETS_SEED, ...readExtra()].map(applyPatch);
}

export async function getTicketById(id: string): Promise<MockTicket | null> {
  const all = await getMyTickets();
  return all.find((t) => t.id === id) ?? null;
}

/** Two events overlap if date ranges intersect (simple check for demo). */
export function eventsOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  const as = new Date(aStart).getTime();
  const ae = new Date(aEnd).getTime();
  const bs = new Date(bStart).getTime();
  const be = new Date(bEnd).getTime();
  return as < be && bs < ae;
}

export async function userHasOverlappingTicket(
  eventStart: string,
  eventEnd: string,
  excludeEventId?: string
): Promise<boolean> {
  const tickets = await getMyTickets();
  const relevant = tickets.filter(
    (t) => t.status === 'active' && t.countsForOverlap !== false && t.eventId !== excludeEventId
  );
  return relevant.some((t) => eventsOverlap(t.dateStart, t.dateEnd, eventStart, eventEnd));
}

export async function userHasTicketWithStatus(
  eventId: string,
  status: MockTicket['status']
): Promise<boolean> {
  const tickets = await getMyTickets();
  return tickets.some((t) => t.eventId === eventId && t.status === status);
}

/** List ticket for resale (mock): creates auction listing and updates ticket. */
export function listTicketForAuction(params: {
  ticket: MockTicket;
  price: number;
  endsAt: string;
  /** Override default "You" (e.g. account deletion demo). */
  sellerLabel?: string;
}): MockAuctionListing {
  const { ticket, price, endsAt, sellerLabel } = params;
  if (price > ticket.pricePaid) {
    throw new Error('Price cannot exceed original purchase price');
  }
  if (ticket.status !== 'active') {
    throw new Error('Ticket not eligible');
  }
  if (ticket.receivedAsGift || ticket.fromAuction) {
    throw new Error('This ticket cannot be listed per policy');
  }

  const listingId = `auc-${crypto.randomUUID()}`;
  const ev = getEventByIdSync(ticket.eventId);
  const listing: MockAuctionListing = {
    id: listingId,
    eventId: ticket.eventId,
    ticketId: ticket.id,
    price,
    originalPrice: ticket.pricePaid,
    endsAt,
    seatLabel: ticket.seatLabel,
    sellerLabel: sellerLabel ?? 'You',
    eventTitle: ticket.eventTitle,
    city: ticket.city,
    venue: ticket.venue,
    layoutType: ev?.layoutType ?? 'free',
  };
  appendListing(listing);
  patchTicket(ticket.id, {
    status: 'auction',
    listedAuctionId: listingId,
  });
  return listing;
}

export function cancelAuctionForTicket(ticketId: string, listingId: string) {
  removeListingById(listingId);
  patchTicket(ticketId, {
    status: 'active',
    listedAuctionId: undefined,
  });
}

export function giftTicketToEmail(ticketId: string, _recipient: string) {
  patchTicket(ticketId, {
    status: 'gifted',
  });
}

/** Account deletion (demo): list every active ticket on the auction at original price. */
export async function queueTicketsForAccountDeletionMock() {
  const tickets = await getMyTickets();
  const active = tickets.filter((t) => t.status === 'active');
  const endsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  for (const t of active) {
    try {
      listTicketForAuction({
        ticket: t,
        price: t.pricePaid,
        endsAt,
        sellerLabel: 'Former account (demo)',
      });
    } catch {
      /* skip ineligible */
    }
  }
}

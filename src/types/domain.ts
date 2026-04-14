/** Domain types for mock main-website flows (replace with API types later). */

export type LayoutType = 'seated' | 'free';

export interface OrganizerSummary {
  id: string;
  name: string;
  logo?: string;
  bio: string;
}

export interface MockEvent {
  id: string;
  title: string;
  excerpt: string;
  description: string;
  coverImage: string;
  city: string;
  venue: string;
  category: string;
  dateStart: string;
  dateEnd: string;
  priceMin: number;
  priceMax: number;
  ticketsLeft: number;
  layoutType: LayoutType;
  featured: boolean;
  organizer: OrganizerSummary;
  showTalents: boolean;
  showVendors: boolean;
  talents: { id: string; name: string; photo?: string; proficiency?: string }[];
  vendors: { id: string; name: string; serviceType: string }[];
  rating: number | null;
  /** Card attending stack — optional; EventCard derives demo defaults if omitted */
  attendingCount?: number;
  attendeeAvatars?: string[];
  gallery: string[];
  ticketTypes: { id: string; name: string; price: number; remaining: number }[];
  /** Map embed / link (demo) */
  lat?: number;
  lng?: number;
  /** Shown in gallery area when set */
  videoUrl?: string;
  /** Optional note from organizer, shown in event details */
  organizerNotes?: string;
  /** Optional venue/place images shown separately from event gallery */
  venueImages?: string[];
}

/** Resale listing (auction area). */
export interface MockAuctionListing {
  id: string;
  eventId: string;
  /** Set when listed from a user ticket */
  ticketId?: string;
  price: number;
  originalPrice: number;
  endsAt: string;
  seatLabel?: string;
  sellerLabel: string;
  eventTitle: string;
  city: string;
  venue: string;
  layoutType: LayoutType;
}

export type TicketStatus =
  | 'active'
  | 'auction'
  | 'gifted'
  | 'used'
  | 'expired'
  | 'cancelled';

export interface MockTicket {
  id: string;
  eventId: string;
  eventTitle: string;
  venue: string;
  city: string;
  dateStart: string;
  dateEnd: string;
  status: TicketStatus;
  typeName: string;
  seatLabel?: string;
  orderRef: string;
  qrPayload?: string;
  pricePaid: number;
  /** If true, overlap check uses this when booking another event same time */
  countsForOverlap?: boolean;
  /** Ticket was received as a gift — cannot re-gift or auction per product rules */
  receivedAsGift?: boolean;
  /** Purchased via auction — cannot gift */
  fromAuction?: boolean;
  /** Linked resale listing when status is auction */
  listedAuctionId?: string;
}

export type SupportCategory =
  | 'technical'
  | 'ticket'
  | 'dispute_organizer'
  | 'account'
  | 'other';

export type EngagementStatus = 'pending' | 'accepted' | 'declined';

export interface MockEngagement {
  id: string;
  organizerName: string;
  organizerId: string;
  topic: string;
  preview: string;
  status: EngagementStatus;
  createdAt: string;
}

export interface MarketplaceTalent {
  id: string;
  slug: string;
  name: string;
  bio: string;
  city: string;
  categories: string[];
  rating: number;
  image: string;
  gallery: string[];
  availability: 'available' | 'reserved';
}

export interface MarketplaceVendor {
  id: string;
  slug: string;
  name: string;
  bio: string;
  city: string;
  serviceCategories: string[];
  rating: number;
  image: string;
  gallery: string[];
}

export interface EventFilters {
  keyword?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  city?: string;
  priceMin?: number;
  priceMax?: number;
  /** `'all'` = no filter */
  layoutType?: LayoutType | 'all';
  availabilityOnly?: boolean;
  featured?: boolean;
}

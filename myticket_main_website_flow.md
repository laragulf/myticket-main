# MyTicket — Main Website Flow

> **Type:** Main Website (Public-Facing)  
> **URL:** `myticket.com`  
> **Users:** Guest (unauthenticated), Guest (registered), Talent, Vendor, Organizer (browsing/buying only)  
> **Shared Flows:** See `myticket_shared_flow.md` for authentication, notifications, payment, localization, and ticket format  
> **Master Reference:** `myticket_platform_flow.md`  
> **Last Updated:** April 2026

---

## 1. Overview

The Main Website is the public-facing entry point to the MyTicket platform. It includes a landing page, event discovery, the full booking flow, ticket management, the Marketplace (browsing and Talent/Vendor response), ratings, support, and account management. This is the only app where user registration is available.

---

## 2. Authentication

The Main Website has its own login and registration pages.

### Login Page

- Email/password login and Google Social Login.
- All roles (Guest, Talent, Vendor, Organizer) can log in.
- See `myticket_shared_flow.md` Section 3.6 for login flow details.

### Registration Page

- Registration is **only available on the Main Website**.
- Email/password registration and Google Social Login.
- See `myticket_shared_flow.md` Sections 3.1–3.5 for full registration flow, required fields, verification, and Terms of Service.

### Forgot Password / Reset Password

- Available on the login page.
- See `myticket_shared_flow.md` Section 3.7 for the full password reset flow.

### Guest Browsing Mode

- Non-registered visitors can browse events, view event details, and explore the platform freely.
- Any action that requires identity (buying tickets, gifting, rating, accessing the Marketplace) triggers a **registration/login prompt**.
- After registering (via Google or email/password), the user is redirected back to continue the action they initiated.

---

## 3. Landing Page & Home

The landing page is the main entry point for the platform. It includes:

- **Hero section** with a prominent search bar and featured event highlights.
- **Featured Events** section — uses an **algorithmic mode by default** (most sold, most viewed). The Admin can override manually from the Admin Dashboard.
- **Category browsing** — category cards/tabs displayed prominently for quick filtering.
- **Navigation** to all major sections: events, marketplace, my tickets, profile.

---

## 4. Event Discovery, Search & Categories

### Event Card (Browse View)

When browsing events (home page, search results, category pages), each event is displayed as a **card** showing the most important information at a glance:

| Element | Description |
|---|---|
| **Cover image** | Primary event image / banner |
| **Event name** | Title of the event |
| **Location** | Venue name and/or city |
| **Description** | Short summary / excerpt |
| **Available tickets** | Number of tickets still available (e.g., "42 tickets left") |
| **CTA button** | Primary action button (e.g., "View Event" or "Get Tickets") |

### Event Detail Page (Full View)

Clicking on an event card opens a **dedicated event page** with comprehensive information:

| Section | Content |
|---|---|
| **Event info** | Full title, complete description, date & time, location with map, category |
| **Cover & gallery** | Cover image + additional event images/videos uploaded by the Organizer |
| **Ticket options** | All available ticket types with prices, seat map (for seated events), and purchase CTA |
| **Organizer info** | Organizer profile summary (name, logo, bio, link to full profile) |
| **Talents** | List of Talents associated with the event (name, photo, link to profile) — **shown only if the Organizer enables it** (per-event toggle) |
| **Vendors** | List of Vendors associated with the event (name, service type, link to profile) — **shown only if the Organizer enables it** (per-event toggle) |
| **Ratings** | Average star rating from past attendees (for recurring or past events) |
| **Share** | Social media sharing buttons and copy-link option |

### Search & Filters

Users can search and filter events using the following criteria:

| Filter | Type | Description |
|---|---|---|
| **Keyword** | Text search | Search by event title, description, or artist name |
| **Category** | Dropdown / tags | Filter by admin-defined event categories |
| **Date range** | Date picker | From date → to date |
| **Location / City** | Dropdown or map | Filter by city or geographic area |
| **Price range** | Slider / min-max | Filter by ticket price range |
| **Layout type** | Toggle / checkbox | Seated (Grid/Section) vs. Free-layout |
| **Availability** | Toggle | Show only events with available tickets |

### Event Categories

Event categories are **managed by the Admin** (see Admin Dashboard flow) and used to classify events across the platform.

| Property | Required | Description |
|---|---|---|
| Name | Yes | Category display name (e.g., "Concerts", "Sports", "Theater") |
| Icon | Yes | Visual icon representing the category |
| Color | No | Optional accent color for UI presentation |

- Categories are displayed on the home page and in search filters for discovery.
- Each event belongs to at least one category.

---

## 5. Booking Flow

1. User browses and selects an event.
2. **For seated events (Grid / Section):**
   - User views the seat map.
   - User selects one or more available seats (one ticket = one seat).
3. **For free-layout events:**
   - User selects quantity of tickets (for self, friends, or family).
4. User proceeds to checkout.
5. **If user is not logged in:** registration/login prompt is displayed. After authentication, the user continues the checkout flow seamlessly.
6. Selected seats are **locked** while the payment is being processed (see Seat Locking Logic below).
7. Payment is processed via Payment Gateway.
8. On **payment success:**
   - Booking record is created.
   - Each seat is marked as BOOKED (lock becomes permanent).
   - A unique QR ticket is generated per seat/ticket.
   - User receives QR tickets via **email (with ticket PDF attached)** + in-app notification.
   - A **success dialog modal** is displayed with celebration/party animations, containing a link to the **ticket details page** (see Booking Confirmation below).
9. On **payment failure:**
   - Seat locks are **released** immediately, making the seats available to other users.
   - User is notified and may retry.

### Booking Confirmation

After a successful purchase, the user sees a **success dialog modal** with:

- **Celebration animation** — party/confetti effect to create a positive purchase moment.
- **Order summary** — event name, number of tickets, total amount paid, order/receipt number.
- **"View My Tickets" link** — redirects to the user's **ticket details page** within their profile.

The ticket details page (within the user's profile) shows:

| Element | Description |
|---|---|
| **Order/receipt number** | Unique reference for this booking |
| **Event details** | Event name, date, time, location |
| **Ticket list** | Each ticket with seat info, ticket type, QR code preview |
| **Download options** | PDF download button, "Add to Wallet" button (Apple/Google) |
| **Actions** | "Gift Ticket", "Drop to Auction" buttons per ticket |
| **Payment summary** | Ticket prices, fees, total paid, payment method |

### Overlapping Event Warning

If a user attempts to purchase tickets for an event that **overlaps in date and time** with another event they already have tickets for, the system displays:

1. A clear **warning alert** informing the user that they already hold tickets for another event at the same time.
2. A **disclaimer statement**: _"MyTicket is not responsible for scheduling conflicts resulting from your decision to purchase overlapping event tickets."_
3. A **"Read here"** link that opens the relevant section of the Terms of Service explaining that overlapping-event purchases are **non-refundable**.
4. An **"Ignore & Continue"** button allowing the user to proceed with the purchase at their own risk.
5. If the user does not click "Ignore & Continue", the purchase is not completed and they are returned to the event page.

### Refund Policy (User-Initiated)

- There is **no direct refund** for change of mind. Users cannot cancel a ticket and request a refund simply because they no longer wish to attend.
- The **auction system is the only way** for a user to recover their ticket value — by listing the ticket for resale before the event day. The seller can set the auction price at the **original purchase price or less**.
- If the Organizer does not offer a direct bank refund, the user's recourse is to resell through the auction. A **disclaimer** explaining the refund duration and refund policy is displayed, and the ticket is **deactivated automatically** upon expiry.
- Refunds are only issued in the following cases:
  - **Event cancellation** by the Organizer or Admin — handled per the cancellation agreement with the organizer.
  - **Significant event edit** — the **Organizer is responsible** for issuing refunds when they make major changes (date, duration, location).
  - **Seat conflict** — payment reversed due to a race condition.

### Seat Locking Logic

- Seats are **locked when the user proceeds to checkout/payment**. The lock is held while the payment transaction is being processed.
- On **payment success**: the lock becomes a permanent booking — the seat is marked as BOOKED.
- On **payment failure**: the lock is **released immediately**, making the seat available to other users.
- Locks have a **timeout** — if a payment is not completed within a reasonable window, the lock expires and the seat is released.

### Race Condition Handling

When two users attempt to purchase the same seat at the same time (simultaneous checkout), the system uses a **fairness-first approach**:

1. **Both users' transactions are rejected** — neither user gets the seat.
2. Both users receive a clear **alert message**: _"A conflict occurred for the selected seat. Please try again."_
3. Both users are **redirected back to the seat selection view** with the seat map updated to reflect current availability.
4. The seats involved in the conflict are **released** so either user (or anyone else) can attempt to book them again.
5. Any payment holds or pre-authorizations for both transactions are released immediately.

### Group Booking & Ticket Assignment

When a user books multiple tickets in a single transaction, each ticket is generated **separately** (one ticket per seat, not a combined ticket). The buyer has two options:

- **Hold all tickets:** The buyer is the holder of all tickets. All QR codes are sent to the buyer's account. The group enters the event together using the buyer's tickets. No name assignment is required.
- **Gift individual tickets:** The buyer can send any individual ticket to another person via their **email address**. If the recipient is a **registered user**, they receive the ticket PDF + a link to their profile dashboard. If the recipient is **not registered**, the email includes a **registration link** — after registering, the ticket is claimed automatically to their account. See Section 7 (Ticket Gifting) for full gifting rules.

---

## 6. My Tickets Page

The **My Tickets** page in the user's profile provides a central view of all their tickets:

| Ticket Status | Description | Available Actions |
|---|---|---|
| **Active** | Valid, upcoming event, not yet used | Gift, Auction, Download PDF, Add to Wallet |
| **In Auction** | Currently listed for resale | View listing, Cancel auction listing |
| **Gifted** | Transferred to another user | View gift confirmation (read-only) |
| **Used** | Scanned and admitted at event | View details, Rate event |
| **Expired** | Event has ended, ticket not used | View details (read-only) |
| **Cancelled** | Event was cancelled, refund issued | View refund details |

---

## 7. Ticket Gifting & Direct Transfer

Users can gift (transfer) tickets directly to another person, outside of the auction system.

### Gifting Flow

1. User navigates to their tickets and selects **"Gift Ticket"** on one or more eligible tickets.
2. User enters the recipient's **email address** or **MyTicket username**.
3. The system checks if the recipient has a registered MyTicket account:
   - **If registered:** The gift is processed immediately. The recipient receives the ticket PDF via email + a link to their profile dashboard + in-app notification.
   - **If not registered:** The system sends an **invitation email** to the recipient containing a **registration link**. After the recipient registers, the ticket is **automatically claimed** to their new account.
4. On confirmation:
   - The sender's QR code for that ticket is **immediately invalidated**.
   - A **brand-new QR code** is generated for the recipient with fresh `ticketId`, `secureHash`, and updated ownership.
   - The sender receives a confirmation that the gift was delivered (or is pending registration for unregistered recipients).
5. The gifted ticket appears in the recipient's **My Tickets** section once claimed.

### Gifting Rules

- Only **valid** tickets can be gifted (not expired, not used, not cancelled, not currently listed in auction).
- Gifting is **free** — no platform fee is charged for direct transfers.
- Recipients do **not** need to have an existing MyTicket account. If unregistered, they receive an invitation email with a registration link to claim the ticket.
- Gifting does **not** involve any money exchange — it is a pure ownership transfer at no cost.
- **A gifted ticket cannot be re-gifted.** Once a ticket is received as a gift, the new holder cannot transfer it again to another user.
- **A gifted ticket cannot be listed in the auction.** The recipient must use the ticket themselves or let it expire — they cannot resell it.

---

## 8. Ticket Auction System

When a user can no longer attend an event, they may list their ticket(s) for resale via the platform's internal auction system.

### Auction Rules

- The seller can list a ticket at the **original purchase price or less** — no price increases above the original price are allowed.
- Auction is available **before the event day starts**.
- Once the event day begins, the auction window closes and no new listings are accepted.
- No refunds are available after the auction window closes.
- The auction has a **countdown timer** visible to buyers.
- Users can auction **individual tickets** from a multi-ticket booking — they are not required to auction all tickets at once. The user has full control: selectable, all, single, or custom selection.
- Only **valid** tickets can be listed for auction. Tickets that are expired, already used, or cancelled are not eligible.
- The platform takes a **commission** on auction sales (configurable by Admin). The seller receives the sale price minus the platform commission.
- **Auction-purchased tickets can be re-auctioned** — the buyer can list the ticket for resale again. However, **auction-purchased tickets cannot be gifted** — the buyer must use the ticket or re-auction it.

### Auction Flow

1. User navigates to their tickets and selects "Drop to Auction" on one or more eligible tickets.
2. Each selected ticket is listed individually in the Auction area at its original purchase price.
3. Another user purchases the auctioned ticket.
4. **QR Transfer:** The original seller's QR code is **immediately invalidated**. A **brand-new QR code** with a fresh `ticketId`, `secureHash`, and updated ownership is generated for the buyer. The old QR cannot be used for entry.
5. Original seller receives the sale proceeds automatically (sale price minus platform commission).
6. Buyer receives the newly generated QR ticket via email + in-app notification.
7. If the ticket is not sold before the auction deadline, it expires unsold — no refund issued to the seller.

### Auction UI

- **Auction area** displays event cards.
- Each event card shows the number of tickets currently available for resale.
- Buyers browse available tickets by event.
- Countdown timer displayed per listing and per event card.
- For seated events, the specific seat information (section, row, seat number, ticket type) is visible to potential buyers.

---

## 9. Waitlist & Event Reminders

### Waitlist System

- When an event is **sold out**, users can join a **waitlist** for that event.
- The waitlist **auto-notifies** users when tickets become available — either through new auction listings or booking cancellations.
- Notifications are sent in the order users joined the waitlist (first come, first served for notification priority).

### Event Reminders

- The system sends **event reminders** to ticket holders before the event.
- Reminder timing and channels are **configured by the Admin** — the Admin decides which notification channels to use for reminders (email, in-app, push notification, or all).
- Typical reminder intervals: 24 hours before and 1 hour before the event (configurable by Admin).

---

## 10. Marketplace — User Side

The Marketplace is the section where Organizers discover Talents and Vendors, and where Talents/Vendors manage their engagement responses.

### Browsing Profiles

- All users can browse **Talent** and **Vendor** profiles in the Marketplace.
- Profiles display: name, bio, location, verification media (Talents), service categories (Vendors), image gallery, ratings, and availability status.
- See `myticket_shared_flow.md` Section 2 for role definitions.

### Talent Profile Requirements

To be listed in the Marketplace, a Talent must complete their profile with:

- **Personal information:** full name, contact details.
- **Bio:** description of their skills, experience, and specialties.
- **Location details** *(optional)*: city/region, willingness to travel — shown publicly only if the Talent opts in.
- **Verification media:** at least one proof of talent — **video** and/or **images** demonstrating their work.
- **Certificate / approval document** *(optional)*: any official certification, license, or credential that validates their talent (e.g., music degree, performer license).

### Vendor Profile Requirements

To be listed in the Marketplace, a Vendor must complete their profile with:

- **Business/personal information:** full name or business name, contact details.
- **Bio:** description of the services offered and experience.
- **Service categories:** the types of services provided (Venue/Place, Security/Guards, Catering/Food, Staffing, Lighting, Sound Systems/AV, or custom).
- **Verification documents** *(required)*: business license, commercial registration, or equivalent proof of legitimacy.
- **Image gallery:** photos of past work, equipment, venues, or service demonstrations.
- **Location details:** city/region and service coverage area.

### Talent/Vendor — Receiving & Responding to Engagements

When an Organizer initiates a chat (from the Organizer Dashboard), the Talent/Vendor side of the conversation appears in the Main Website:

1. Talent/Vendor receives a **notification** that an Organizer has started a chat.
2. The Talent/Vendor can view the Organizer's full profile (organization details, venue, past events, gallery, etc.).
3. All negotiation happens within the **real-time chat** — pricing, terms, scheduling, event details.
4. The Talent/Vendor either **accepts** or **declines** the engagement through the chat.
   - On **accept**: the Talent/Vendor's availability status is automatically changed to **"Reserved"**.
   - On **decline**: the Organizer is notified. No status change occurs.
5. Post-acceptance, the Talent/Vendor can manually update their status back to **"Available"** or any other status at any time.

### Availability Status

| Status | Meaning |
|---|---|
| **Available** | Open to new offers and bookings |
| **Reserved** | Has accepted an offer and is committed (set automatically on accept, changeable by the user) |

### Financial Independence

- The platform does **not** handle, process, or escrow any payments between Talents/Vendors and Organizers.
- All financial arrangements (payment method, timing, invoicing) are handled **directly between the two parties** outside the platform.
- MyTicket's role is strictly limited to **discovery, profile verification, and connection facilitation**.

---

## 11. Ratings

The platform uses a **star rating system only** — there are no written text reviews.

### Event Ratings

- Users who **attended an event** (ticket status = USED) can leave a **star rating** for the event after it concludes.
- The average star rating is displayed on the event page for future reference.

### Talent & Vendor Ratings (Mutual)

- **Organizers** can rate Talents and Vendors they have hired through the Marketplace.
- **Talents and Vendors** can rate Organizers they have worked with.
- Ratings are displayed on the respective Marketplace profiles and contribute to overall reputation.

### Rating Rules

- Ratings are available **only after** an event is attended (ticket USED) or after a hiring engagement is completed.
- Each user can rate only **once** per event or per engagement.
- Ratings are **public** and visible on the relevant profile or event page.

---

## 12. Event Sharing & Social

### Sharing Options

- Every event has **shareable links** that users can distribute through:
  - **Social media platforms** — direct sharing to popular platforms (Twitter/X, WhatsApp, Instagram, etc.).
  - **In-platform sharing** — users can share event links or invite friends directly within MyTicket.
  - **Copy link** — generate a shareable URL for any channel.

---

## 13. Profile & Account Management

### Profile Management

- See `myticket_shared_flow.md` Section 3.8 for profile editing, re-verification, and future ID verification.

### Role Application Flow

1. User registers as Guest (default role upon registration).
2. User submits a role application (Talent, Vendor, or Organizer) with supporting documents.
3. Admin reviews and approves or rejects the application (in Admin Dashboard).
4. On approval: role is granted **permanently** and user receives email + in-app notification. The role **cannot be changed** after approval.
5. On rejection: user receives email + in-app notification with reason. The user may revise and resubmit.
6. **Talent profiles** are subject to admin review — a **disclaimer about upload quality** is shown to Talents during profile setup (e.g., minimum resolution, clear content, professional presentation).

### Account Deletion

Users can request to **delete their account** from the platform. Deletion results in **permanent loss of all account data**.

**Pre-Deletion Disclaimer:**

Before deletion, the system displays a **disclaimer alert** warning the user:

- All personal data, profile information, and account history will be **permanently deleted**.
- All **valid/active tickets** will be **automatically sent to the auction** for re-sell. The user may recover value if the tickets sell before the auction deadline.
- Tickets **already listed in auction** (pending auctions) will **not be affected** — they continue as-is until sold or expired.
- This action is **irreversible**. This policy is also documented in the **Terms of Service**.

**Deletion Execution:**

1. User reviews the disclaimer and acknowledges the consequences.
2. User confirms account deletion.
3. The system **automatically lists all valid/active tickets** in the auction for re-sell.
4. Account data is permanently removed (personal info, profile, credentials).
5. The user receives a final confirmation email that their account has been deleted.
6. Auction proceeds from any sold tickets are processed according to the standard auction flow (minus platform commission).

---

## 14. Support — User Side

### Chat Support

- The platform provides an **open chat support** feature accessible to all registered users.
- Users can initiate a live chat session with the support team for real-time assistance with any issue: event problems, ticket issues, technical bugs, disputes with organizers, etc.

### Text Box (Offline Support)

- In addition to live chat, users can submit a **text-based support message** describing their issue.
- This is useful when live support is unavailable or when the user prefers asynchronous communication.
- Each message is submitted to the **Admin support dashboard**.

### Status Updates

- Users receive a notification when their support request is reviewed or resolved.

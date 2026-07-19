# ROLLUP PROPERTIES — V2 UPGRADE BRIEF

**Project:** Rollup Properties — https://rollup-properties.vercel.app/
**Doc purpose:** Implementation brief for the next release. Drop into the repo as `docs/V2_UPGRADE_BRIEF.md` and execute feature by feature.
**Benchmark:** Zillow property detail experience (ref: https://www.zillow.com/apartments/liberty-mo/crossroads-village-apartments/5Xt9F7/)
**Goal:** A world-class real estate platform for Kenya with everything renters, buyers, students, and listers need — maps, neighborhood intel, rich media, tours, and a sustainable revenue model.

---

## Guiding Constraints (read before coding)

1. **Do NOT change the listing creation flow.** All new intelligence (geocoding, maps, nearby amenities) is derived automatically from the address the lister already provides. Zero extra work for listers.
2. **Keep the Student Housing Hub.** It is not replaced — it gets better placement (see §4.4).
3. **Mobile-first.** The majority of traffic is mobile Kenya. Every feature is designed for a phone screen first.
4. **Production quality only:** strict TypeScript, ESLint clean, WCAG AA, semantic HTML, optimized images, SEO structured data, server-enforced business rules.
5. **Validate each milestone** (build clean, lint clean, manual mobile QA) before moving to the next.

---

## Scope at a Glance

| #  | Item                                                    | Type    | Priority |
|----|---------------------------------------------------------|---------|----------|
| 13 | Fix "Bedsitter Bedsitter / Studio Studio" title bug     | Bug     | P0       |
| 1  | Map / Satellite / Street View on every listing          | Feature | P0       |
| 2  | Bigger images + tap-to-expand lightbox gallery          | Feature | P0       |
| 3  | Book a Tour                                             | Feature | P0       |
| 4  | Auto neighborhood amenities (14 categories)             | Feature | P0       |
| 14 | Listing monetization (20 free → KES 99) + Pro Media     | Feature | P0       |
| 5  | Installable PWA                                         | Feature | P1       |
| 7  | Realtor website handoff after contact unlock            | Feature | P1       |
| 6  | Careers page                                            | Page    | P1       |
| 8–12 | Footer: About, News, Help, Advertise, Applicant Privacy Notice | Pages | P1 |

---

## 1. Maps, Satellite & Street View (Zillow-style)

Every property detail page gets a tabbed map module: **Map | Satellite | Street View**.

### Implementation
- **Geocoding (server-side):** When a listing is created or its address edited, geocode via Google Geocoding API and store `lat`, `lng`, `geocodedAt` on the listing record. Run a one-off backfill script for all existing listings.
- **Map + Satellite:** Google Maps JavaScript API, `mapTypeId` toggle between `roadmap` and `hybrid`. Property marker with price pin.
- **Street View:** On load, query `StreetViewService.getPanorama()` for a panorama within 100m of the coordinates.
  - Panorama found → render interactive Street View in the tab.
  - Not found → **hide the Street View tab entirely.** Much of Kenya lacks coverage; never show a black/broken panorama.
- **Performance:** Lazy-load the whole map module (`next/dynamic`, `ssr: false`) — it sits below the fold. Show a static map image placeholder until interaction/scroll to protect LCP and avoid CLS.
- **API keys:** Two keys via env vars — a browser key (HTTP-referrer restricted to production + preview domains) and a server key (IP/service restricted) for geocoding. Set Google Cloud budget alerts.

### Acceptance criteria
- [ ] Map/Satellite toggle works on all listings with a stored address.
- [ ] Street View tab appears only where coverage exists.
- [ ] No layout shift; map JS not loaded until the module is near viewport.
- [ ] Existing listings backfilled with coordinates.

---

## 2. Photo Experience Upgrade

Match the Zillow reference: large, immersive, plentiful photos.

### Implementation
- **Detail page gallery:** Full-width primary image on mobile (taller aspect, ~4:3), thumbnail strip or 2-up grid beneath, photo count badge ("1 / 24").
- **Tap-to-expand lightbox:** Tapping any image opens a full-screen lightbox with:
  - Pinch-to-zoom and swipe navigation on mobile
  - Arrow keys + Esc on desktop, visible close button, image counter
  - Focus trap + body scroll lock (WCAG)
- **Cards/search results:** Increase image height on listing cards so photos dominate the card.
- **`next/image` everywhere:** responsive `sizes`, `priority` on the first detail image, blur placeholders, modern formats via the image CDN.
- **Sufficient images (soft nudge, no flow change):** In the existing upload step, add helper copy: "Listings with 8+ photos get significantly more inquiries." Support up to 30 images per listing (configurable cap). Show remaining-slots counter.

### Acceptance criteria
- [ ] Lightbox works with touch gestures on mobile and keyboard on desktop.
- [ ] First gallery image is the LCP element and loads with priority.
- [ ] No change to the lister upload flow beyond helper copy.

---

## 3. Book a Tour

### Implementation
- **CTA placement:** "Book a Tour" button on the detail page; on mobile it lives in a sticky bottom bar next to the contact/unlock CTA.
- **Form fields:** name, phone (validate Kenyan format `+254 / 07xx / 01xx`), email (optional), preferred date (next 14 days), time slot (Morning / Afternoon / Evening), tour type (In-person / Video call), optional message.
- **On submit:**
  1. Persist a `TourRequest` record.
  2. Notify the lister — email plus a WhatsApp deep link (`wa.me`) prefilled with the request summary.
  3. Show the renter a confirmation state with expected response time.
- **Lister dashboard:** "Tour Requests" tab — list with status workflow: Pending → Confirmed → Completed / Cancelled.
- **Anti-spam:** rate-limit per IP/phone, honeypot field.

### Acceptance criteria
- [ ] Tour request reaches the lister and appears in their dashboard.
- [ ] Renter sees confirmation; invalid phone numbers are rejected client- and server-side.

---

## 4. Neighborhood Intelligence (Auto Amenities Mapping)

**Zero lister effort.** Everything derives from the coordinates stored in §1. The listing flow does not change.

### 4.1 Data pipeline
- Server route/job: for each listing, run Google Places **Nearby Search** per category within a walkable radius (default 1.5 km; tune per category — e.g., hospitals/universities 3 km).
- Return **top 5 per category**, sorted by distance, with name, rating, and distance in m/km.
- **Caching is mandatory for cost control:** store the results as an `amenitiesSnapshot` JSON on the listing with `amenitiesFetchedAt`. TTL 30 days; refresh lazily on page view after expiry. Never call Places live per page view.

### 4.2 Category → Google Places mapping

| Rollup category | Places types / keywords |
|---|---|
| Cafes | `cafe` |
| Shopping | `shopping_mall`, `clothing_store` |
| Arts and entertainment | `art_gallery`, `movie_theater`, `museum`, `tourist_attraction` |
| Highlights | Curated: top-rated (≥4.5★, ≥100 reviews) across all categories |
| Restaurants | `restaurant` |
| Groceries | `supermarket`, `grocery_or_supermarket` |
| Nightlife | `night_club`, `bar` |
| Beauty and spas | `beauty_salon`, `spa` |
| Active life | `park`, `stadium` |
| Fitness | `gym` |
| Public transportation | `bus_station`, `transit_station`, `train_station` (+ keyword "matatu stage") |
| Hospitals and medical | `hospital`, `pharmacy`, `doctor` |
| Kindergartens, Primary Schools, Daycare | `primary_school`, `preschool`, keyword "daycare" |
| Colleges and universities | `university` |

### 4.3 UI — "What's Nearby" section on the detail page
- Horizontal category chips (mobile) / accordion; each item shows name, distance, star rating.
- "View on map" plots the selected category's markers on the §1 map module.
- Empty categories are hidden, never shown as "0 results."

### 4.4 Student Housing Hub placement (keep, don't replace)
- Hub remains a standalone destination with its own nav entry and a prominent home-page section.
- **Auto cross-link:** any listing whose amenities include a university within 3 km shows a banner — "Near [University name] — explore the Student Housing Hub →".

### Acceptance criteria
- [ ] Amenities appear automatically on every geocoded listing with no lister input.
- [ ] Places API calls are cached; repeat page views trigger zero external calls within TTL.
- [ ] Student Housing Hub reachable from nav + home + relevant listings.

---

## 5. Installable Web App (PWA)

### Implementation
- `manifest.webmanifest`: name, short name, 192/512 icons (maskable), theme + background color, `display: standalone`, start URL.
- Service worker (via `next-pwa` or Workbox): precache app shell + static assets; network-first for listing data; offline fallback page ("You're offline — reconnect to browse listings").
- **Custom install prompt:** capture `beforeinstallprompt`, show a dismissible "Install Rollup Properties" banner (remember dismissal in a cookie for 14 days). On iOS Safari (no prompt event), show a one-time instruction sheet: Share → Add to Home Screen.
- Analytics events: `install_prompt_shown`, `install_prompt_accepted`.

### Acceptance criteria
- [ ] Lighthouse "installable" check passes.
- [ ] Android/desktop show the install banner; iOS shows instructions.
- [ ] App launches standalone from the home screen with correct icon/splash.

---

## 6. Careers Page

### Implementation
- Route: `/careers`. Mission intro + open-roles list + role detail + application form (name, phone, email, CV upload or link, cover note) persisting to DB and emailing the team.
- Roles stored as editable data (DB table or a `careers.json`) so new roles don't require a deploy.
- **Seed roles (placeholders — final list to be brainstormed by the team):** Verification Agents (field listing verification), Sales Executives, Marketing & Content, Customer Support, Pro Media Creators (photographers / videographers / 3D).
- Empty state when no roles are open: "No openings right now — join our talent pool" (same form, general application).

---

## 7. Realtor Handoff After Contact Unlock

The existing unlock flow is unchanged. This extends what the user sees **after** unlocking.

### Implementation
- New optional listing fields: `managerWebsiteUrl`, `managerAgencyName`.
- Post-unlock contact card shows, in order: property manager name + phone/WhatsApp (existing), then — if provided — a "Visit [Agency] website →" external link (`rel="noopener noreferrer"`, outbound click tracked as `realtor_link_clicked`).
- If no website is set, the card renders contacts only — no empty slot.
- Lister dashboard: listers can add/edit their agency website on their profile or per listing (optional field, does not block publishing).

---

## 8–12. Footer & Content Pages

### New footer information architecture

| Company | Support | Partners | Legal |
|---|---|---|---|
| About | Help | Advertise | Applicant Privacy Notice |
| Careers | Contact | List with Us / Pro Media | Privacy Policy |
| News | | | Terms of Service |

### Pages
- **§8 `/about`** — Rollup story, mission for Kenyan housing, how verification builds trust, team/contact.
- **§9 `/news`** — Updates & articles. MDX-based (index + article pages), Article structured data, added to sitemap. Doubles as the SEO content engine.
- **§10 `/help`** — FAQ grouped by audience (Renters & Buyers / Students / Listers) + contact form. Accordion UI, searchable later.
- **§11 `/advertise`** — Value proposition for advertisers (featured listings, banner placements, sponsored neighborhoods) + inquiry form.
- **§12 `/applicant-privacy-notice`** — Privacy notice covering job applicants and tour/contact form applicants, aligned to the **Kenya Data Protection Act, 2019** (what's collected, why, retention, rights, contact). Ship as draft copy and **flag for legal review before public launch**.

All pages: semantic HTML, unique metadata/OG tags, sitemap entries.

---

## 13. Bug — Duplicated Property Type in Listing Titles

**Symptom:** titles render as "Bedsitter Bedsitter in South B", "Studio Studio Apartment…". Likely cause: the title builder appends the property-type field to a lister-entered title that already contains the type (or the type is concatenated twice).

### Fix — three layers
1. **Root cause:** Centralize title generation in one `buildListingTitle(listing)` util composed from structured fields. Before composing, strip a leading/duplicated occurrence of the property-type value from the free-text portion (case-insensitive).
2. **Data migration:** One-off script over existing listings — collapse a repeated token **only when the repeated token equals that listing's `propertyType` value** (case-insensitive). Do NOT do naive consecutive-word dedupe: legitimate names can repeat words. Run with `--dry-run` first and output a before/after report for review.
3. **Display guard + tests:** Apply the same type-aware normalizer at render as a safety net. Unit tests: `"Bedsitter Bedsitter" → "Bedsitter"`, `"Studio Studio Apartment" → "Studio Apartment"`, and a case proving unrelated repeated words in estate names are untouched.

---

## 14. Monetization — Free Quota, Paid Listings & Pro Media Services

### 14.1 Freemium listing quota (automatic payment gate)
- **Free tier:** first **20 published listings** per lister account (cumulative).
- **Listing #21 onward:** **KES 99 per listing**, charged at publish time.
- **Flow (form unchanged — gate appears only at the publish step):**
  1. Lister completes the normal listing form.
  2. On publish, the server checks the account's quota.
  3. Over quota → payment screen: "You've used your 20 free listings. Publish this one for KES 99."
  4. Payment success → listing auto-publishes. Abandoned → listing saved as **Draft (Pending Payment)**, resumable from the dashboard.
- **Payment provider:** **M-Pesa Daraja STK Push** as the primary rail (KES-native). Persist a `Payment` record (account, listing, amount, M-Pesa receipt no., status); confirm via the Daraja callback → publish. Handle STK timeout/decline with a clear retry path. Card fallback can come later.
- **Enforcement is server-side only** — the client never decides quota. Admin flag for overrides/comps.

### 14.2 Pro Media Services (paid, for sustainability & profitability)
Property managers, caretakers, agents, and landlords can request Rollup's team for: professional photography, video tours (hosted URL), 3D/virtual tours, and other listing enhancements.

- **MVP:** "Boost Your Listing" entry points in the lister dashboard and on the post-publish success screen → request form (services checkboxes, property location, preferred date, notes) → team notified by email + stored in DB with status (New → Scheduled → Delivered).
- Pricing displayed as "from KES —" placeholders; **final price list TBD by the team.** Collect payment via M-Pesa manually at first; productize checkout once demand is proven.

### Acceptance criteria
- [ ] Listing #21 cannot be published without a confirmed KES 99 payment (verified server-side).
- [ ] STK Push happy path, timeout, and decline all handled with clear UI states.
- [ ] Draft (Pending Payment) listings resumable; payments and receipts logged.
- [ ] Pro Media requests reach the team and are trackable by status.

---

## Data Model Additions (illustrative — adapt to existing schema)

```
listings:        + lat, lng, geocodedAt, amenitiesSnapshot (JSON), amenitiesFetchedAt,
                   managerWebsiteUrl, managerAgencyName
accounts:        + freeListingQuota (default 20), publishedListingCount
tour_requests:   id, listingId, name, phone, email?, date, slot, tourType, message?, status, createdAt
payments:        id, accountId, listingId, amountKES, provider ('mpesa'), providerRef, status, createdAt
media_requests:  id, accountId, listingId?, services[], location, preferredDate?, notes?, status, createdAt
career_apps:     id, roleId?, name, phone, email, cvUrl?, note?, createdAt
```

---

## Non-Functional Requirements

- **Performance:** LCP < 2.5s on a mid-range Android over Fast 3G; all third-party scripts (Maps) lazy-loaded; images sized responsively.
- **SEO:** schema.org structured data (`Residence` / `Offer` on listings, `Article` on News), OG images, updated sitemap with all new routes.
- **Accessibility:** WCAG AA — lightbox focus trap, keyboard nav, map text alternatives, contrast-checked CTAs.
- **Cost control:** Geocoding + Places responses cached in DB; API keys restricted; Google Cloud budget alerts configured.
- **Analytics events:** `tour_request_submitted`, `contact_unlocked`, `realtor_link_clicked`, `install_prompt_accepted`, `listing_payment_success`, `media_service_requested`.

---

## Rollout Plan

**Phase 1 — Core experience & revenue (P0):**
§13 title bug → §1 maps → §2 gallery → §3 tours → §4 amenities → §14 quota + M-Pesa gate.

**Phase 2 — Platform & trust (P1):**
§5 PWA → §7 realtor handoff → §6 careers → §8–12 footer pages.

Validate each milestone (clean build, clean lint, mobile QA pass) before starting the next.

---

## Decisions Needed (defaults apply unless changed — none block Phase 1 start)

| Decision | Default |
|---|---|
| Payment rail for KES 99 gate | M-Pesa Daraja STK Push (confirm Paybill/Till availability) |
| Free-quota basis | 20 cumulative published listings per account |
| Max images per listing | 30 |
| Careers roles final list & Pro Media pricing | Placeholder until team brainstorm |

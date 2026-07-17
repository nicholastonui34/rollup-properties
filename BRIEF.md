# Rollup Properties — Execution Brief

**Verified property marketplace for Kenya. Rentals first. Nairobi first. Zillow-grade, Kenya-built.**

---

## 1. The Problem

Kenya's rental and property market runs on WhatsApp groups, Facebook posts, roadside signage, and brokers ("middlemen") who:

- Charge viewing fees for houses that don't exist or are already taken
- Post stolen/recycled photos that don't match the actual unit
- Give vague locations ("near Thika Road") instead of real addresses
- Insert themselves between tenant and landlord, inflating rent and fees
- Disappear after collecting deposits (outright scams are common)

There is **no trusted, searchable, verified national listings platform**. Property53, BuyRentKenya and Jiji exist but verification is weak, listings go stale, and brokers dominate. The trust gap is the product opportunity.

## 2. The Solution

**Rollup Properties** — a verified listings platform where:

- Every listing is **verified before it goes live** (real unit, real photos, real address, real manager)
- Renters/buyers search with real filters: location, price, bedrooms, amenities, property type
- Each listing has **enough images** (minimum 5, interior + exterior), exact address/estate, and honest pricing
- Users pay a small fee to **unlock the property manager's direct contact** — no middlemen, no viewing-fee scams
- Verified badge + verification date displayed on every listing

**Priority order:** Rent (primary) → Buy/Sell (secondary) → Mortgage (later, likely via bank partnerships).

**Geography:** Nairobi (primary launch market) → Mombasa, Kisumu, Nakuru, Eldoret → all towns.

---

## 3. Users & Roles

| Role | Who | What they do |
|------|-----|--------------|
| **Seeker** | Tenant / buyer | Search, filter, save favorites, pay to unlock contacts, report bad listings |
| **Lister** | Landlord, property manager, licensed agent | Create listings, upload photos, manage availability, respond to leads |
| **Verifier** | Rollup staff / vetted field agents | Physically or remotely verify listings, approve/reject with notes |
| **Admin** | You | Full dashboard: users, listings, verifications, payments, reports, analytics |

Key trust rule: **listers are identity-verified (ID + phone) before their first listing goes live**, and each listing is separately verified. Two layers.

---

## 4. Core Features

### 4.1 Search & Discovery (the heart of the product)
- Full-text + filter search: city → area/estate (e.g. Nairobi → Kilimani, Kasarani, Ruaka, Syokimau)
- Filters: rent/buy, price range (KES), bedrooms (bedsitter, studio, 1BR–5BR+, maisonette, bungalow, apartment, townhouse, commercial), bathrooms, furnished/unfurnished, amenities (parking, borehole/water, backup generator, lift, gym, pool, gated, CCTV, fibre ready, balcony, DSQ)
- Map view (listings pinned to real coordinates) + list/grid view
- Sort: newest, price low→high, price high→low, recently verified
- Saved searches + email/SMS alerts ("new 2BR in Kilimani under 60k")

### 4.2 Listing Detail Page
- Photo gallery (min 5 photos enforced; cover photo + interior, exterior, bathroom, kitchen)
- Verified badge with verification date ("Verified 12 Jul 2026 by Rollup")
- Exact location: estate, street, map pin (full pin precision can be gated behind contact unlock to protect landlords)
- Price (rent/month or sale price), deposit terms, service charge if any
- Amenities checklist, description, unit availability count (for apartment blocks)
- **Locked contact section** → pay via M-Pesa to reveal manager's name + phone + WhatsApp link
- Report listing button (feeds admin review; auto-suspend at threshold)

### 4.3 Lister Dashboard
- Create/edit listings (draft → submitted → in verification → live → rented/sold → archived)
- Photo upload with quality guardrails (min count, min resolution)
- Lead inbox: see who unlocked their contact
- Mark unit as taken (stale listings are the #1 killer of competitor platforms — auto-expiry after 30 days without renewal, one-tap renew)

### 4.4 Verification Workflow (the moat)
- Lister KYC: national ID + phone (OTP) captured at onboarding; agents can add registration number
- Listing verification queue in admin: verifier checks photos vs. video walkthrough / site visit, confirms address, confirms lister controls the property
- Statuses: `PENDING → APPROVED / REJECTED (with reason) / NEEDS_INFO`
- Every approval stamped with verifier + timestamp; badge shown publicly
- Re-verification: listings older than 60 days get flagged for refresh
- MVP reality: verification is **manual admin work at first** (you/your team review submissions + call the landlord + require a short video walkthrough). Field-agent network comes later. Build the workflow tooling now, staff it lean.

### 4.5 Payments (M-Pesa first)
- **Contact unlock:** M-Pesa STK Push (Safaricom Daraja API). User enters phone → prompt on their phone → pays → contact revealed instantly + SMS/email receipt. Unlock persists forever on their account for that listing.
- Card fallback later (Paystack or Flutterwave — both support KE cards + M-Pesa and simplify Daraja headaches; **recommendation: start with Paystack**, it wraps M-Pesa STK and cards in one API and one KYC process, far less friction than direct Daraja onboarding)
- Full payments ledger in admin

### 4.6 Trust & Safety
- Report listing / report lister flows
- Auto-suspend listing at N reports pending review
- Refund policy: if a listing is proven fake after unlock, refund + ban lister (this policy is a marketing weapon — advertise it)
- Reviews of listers by users who unlocked contact (phase 2)

---

## 5. Monetization

| Stream | Mechanics | Phase |
|--------|-----------|-------|
| **Pay-per-unlock** (primary) | KES 99–200 per contact unlock via M-Pesa. Cheaper than any broker "viewing fee" (typically KES 500–1,000 per house). Position as: *pay once, talk directly to the manager, no broker.* | MVP |
| **Seeker bundle** | KES 499 for 10 unlocks / 30 days — for serious house hunters | MVP+1 |
| **Featured listings** | Listers pay to appear top of search / homepage (KES 500–2,000/wk) | Phase 2 |
| **Lister subscriptions** | Free: 2 active listings. Pro (agents/managers with portfolios): KES 2,000–5,000/mo for unlimited + analytics | Phase 2 |
| **Verification fee** | Optional expedited verification for listers | Phase 2 |
| **Mortgage referrals** | Lead-gen partnerships with banks (NCBA, KCB, Absa) once buy-side has traffic | Phase 3 |

Pricing note: unlock price is the conversion lever — launch at **KES 99** (impulse-priced, well under broker fees), raise once trust is established. First unlock free for new signups is worth A/B testing for growth.

---

## 6. Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js (App Router) + TypeScript** | Same stack as BV Computers/SwiftVerify; SSR for SEO (listing pages must rank on Google — huge free acquisition channel) |
| Styling | Tailwind CSS + shadcn/ui | Fast, enterprise-clean |
| Database | **Neon Postgres + Prisma** (pin Prisma 6.19.x — known-good from BV Computers) | Relational fits listings/payments/verification perfectly; Neon free tier to start |
| Geo | `lat`/`lng` columns + Leaflet + OpenStreetMap tiles (free) | PostGIS/Mapbox only if/when radius search demands it |
| Images | **Cloudinary** (free tier: 25GB) | Upload widget, auto-optimize/WebP, transformations for thumbnails |
| Auth | Auth.js (NextAuth) — phone-first mindset, email/password + Google to start; OTP via SMS when SMS provider added | Kenyans are phone-first; email optional long-term |
| Payments | **Paystack** (M-Pesa STK + cards, one API) | Direct Daraja is phase-2 optimization if fees justify it |
| SMS | Africa's Talking (OTP + alerts) | KE-native, cheap |
| Hosting | Vercel | Known workflow |
| Analytics | Vercel Analytics + PostHog (free tier) | Funnel: search → view → unlock is THE metric |

**Environment gotchas (from prior projects):**
- OneDrive path → use **webpack, not Turbopack** for dev (`next dev` without `--turbopack`)
- Avoid raw HTML5 entities in JSX (use `&amp;` escapes or string literals)

---

## 7. Data Model (Prisma sketch)

```
User        id, name, phone (unique), email?, passwordHash, role (SEEKER|LISTER|VERIFIER|ADMIN),
            idNumber?, idVerifiedAt?, createdAt

Listing     id, listerId → User, title, slug, description,
            purpose (RENT|SALE), propertyType (BEDSITTER|STUDIO|APARTMENT_1BR..5BR|MAISONETTE|
            BUNGALOW|TOWNHOUSE|COMMERCIAL|LAND), 
            priceKes, depositKes?, serviceChargeKes?, 
            county, town, area (e.g. "Kilimani"), estate?, streetAddress, lat?, lng?,
            bedrooms, bathrooms, furnished, amenities (string[]),
            status (DRAFT|SUBMITTED|IN_VERIFICATION|LIVE|NEEDS_INFO|REJECTED|TAKEN|EXPIRED|SUSPENDED),
            verifiedAt?, verifiedById?, expiresAt, viewCount, createdAt, updatedAt

ListingImage  id, listingId, url, publicId, position, isCover

Verification  id, listingId, verifierId, status, notes, evidenceUrls (string[]), createdAt

Unlock      id, userId, listingId, paymentId, createdAt   @@unique([userId, listingId])

Payment     id, userId, amountKes, provider (PAYSTACK|MPESA), providerRef, phone,
            status (PENDING|SUCCESS|FAILED), purpose (UNLOCK|BUNDLE|FEATURED|SUBSCRIPTION), createdAt

SavedListing  userId, listingId
SavedSearch   id, userId, filtersJson, alertsEnabled
Report        id, listingId, reporterId, reason, details, status, createdAt

Location seed data: County → Town → Area table (Nairobi areas seeded first: Kilimani, Kileleshwa,
Lavington, Westlands, Parklands, South B/C, Langata, Karen, Kasarani, Roysambu, Ruaka, Kahawa,
Embakasi, Syokimau, Kitengela, Rongai, Ruiru, Juja, Donholm, Umoja, Pipeline...)
```

---

## 8. Milestones

**M1 — Foundation**
Scaffold Next.js + TS + Tailwind + shadcn/ui, Prisma + Neon, Auth.js (signup/login, roles), base layout, brand system (logo wordmark, colors, typography). Location seed data for Nairobi.

**M2 — Listings core**
Lister dashboard: create/edit listing with photo upload (Cloudinary), draft/submit flow, min-5-photo enforcement. Listing detail page (public, contact locked).

**M3 — Search & discovery**
Search page: filters (purpose, area, price, bedrooms, type, amenities), sort, pagination, grid cards with cover photo + verified badge. Area landing pages (`/rent/nairobi/kilimani`) for SEO. Map view with Leaflet.

**M4 — Verification engine**
Admin dashboard: verification queue, approve/reject/needs-info with notes + evidence, lister KYC review, verified badge + date rendering, 30-day expiry + renewal, re-verification flags.

**M5 — Payments & unlock**
Paystack integration (M-Pesa STK + card), contact-unlock flow end-to-end, unlock persistence, receipts, payments ledger in admin, refund flow (manual admin action).

**M6 — Trust & retention**
Favorites, saved searches + alerts (email first, SMS later), report listing flow, auto-suspend threshold, lister lead inbox ("3 people unlocked your contact").

**M7 — Polish & SEO**
Metadata/OG images per listing, sitemap, JSON-LD (`RealEstateListing` schema), performance pass, mobile-first audit (most traffic will be phones on 4G), empty states, 404s, legal pages (Terms, Privacy, Refund Policy — Kenya DPA 2019 compliance note: register with ODPC as data controller when live).

**M8 — Launch**
Seed 30–50 genuinely verified Nairobi listings before public launch (cold-start: walk estates, partner with 5–10 small property managers — they list free, you verify). Deploy to Vercel, custom domain, PostHog funnels, launch.

**Post-launch:** bundles & featured listings → lister subscriptions → buy/sell depth → reviews → more cities → mortgage partnerships → mobile app (PWA first).

---

## 9. North-Star Metrics

1. **Unlock conversion**: listing views → paid unlocks (the business)
2. **Listing freshness**: % of live listings verified/renewed in last 30 days (the trust)
3. **Successful contact rate**: % of unlocks that reach a real, available property (the promise — survey via post-unlock SMS "Did you reach the manager? Was the house real?")
4. Weekly active seekers; new verified listings/week

## 10. Open Decisions (resolve during build, defaults chosen)

- **Default: Paystack over raw Daraja** for MVP (revisit for fee optimization at scale)
- **Default: exact map pin gated behind unlock**, area-level pin public (protects landlords, adds unlock value)
- **Default: KES 99 launch unlock price**, first unlock free for new accounts
- Domain: rollupproperties.co.ke (preferred, KE trust signal) or .com — check availability
- Verification SLA to advertise: "listings verified within 48 hours"

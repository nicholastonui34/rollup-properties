# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

**Rollup Properties** (product/brand name in the running app is **"Nyoomba"** — see `src/lib/site.ts:SITE_NAME`; the `package.json` name is `nyoomba` too) is a verified rental/property-listing marketplace for Kenya. Core loop: listers submit a listing → an admin/verifier reviews and approves it → seekers search/browse for free → seekers pay a small fee to unlock a lister's direct contact. Full product spec: `BRIEF.md`. Second-release feature spec (maps, tours, neighborhood amenities, monetized listing quota, PWA, content pages): `docs/V2_UPGRADE_BRIEF.md`. A dated orientation + gap audit of the codebase exists at `AUDIT.md` — useful background, but re-verify specifics against source since it can drift from current code.

## Commands

```bash
npm run dev      # next dev --webpack  (forced webpack, not Turbopack — see AGENTS.md/BRIEF.md §6 "Environment gotchas")
npm run build    # next build --webpack
npm start        # next start (serve a production build)
npm run lint     # eslint
```

- `postinstall` runs `prisma generate` automatically.
- **There is no automated test suite** (no Jest/Vitest/Playwright configured). One-off verification scripts live in `scripts/*.ts` (run via `npx tsx scripts/<name>.ts`) — e.g. `test-listing-title.ts`, `check-listings.ts`, `check-payments.ts`, `check-unlocks.ts`, `simulate-success.ts`. Treat lint (`npm run lint`) and `npm run build` as the correctness gate for changes.
- DB: `npx prisma generate`, `npx prisma migrate dev`, `npx prisma db seed` (seed script: `prisma/seed.ts`, seeds the County → Town → Area location table, Nairobi seeded deepest). `scripts/seed-nairobi-listings.ts` / `scripts/seed-test-listing.mjs` seed fixture listings for local dev (uses `images.unsplash.com` photos, whitelisted in `next.config.ts` for that reason only).
- Migration/backfill one-offs run the same way: `scripts/backfill-listing-geocoding.ts`, `scripts/backfill-pm-slugs.ts`, `scripts/fix-duplicate-listing-titles.ts` (supports `--dry-run`).

### Environment variables

No `.env.example` is checked in (`.env*` is gitignored). Required vars, gathered from source:

- `DATABASE_URL` — Postgres (Neon) connection string, used by `prisma/schema.prisma`.
- `AUTH_SECRET` — required by Auth.js v5 (`src/lib/auth.ts`, JWT session strategy).
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — image uploads (`src/lib/cloudinary.ts`).
- `PAYSTACK_SECRET_KEY` — payments (`src/lib/paystack.ts`).
- `CRON_SECRET` — authorizes `/api/cron/saved-search-alerts`.
- `RESEND_API_KEY`, `EMAIL_FROM`, `TEAM_EMAIL` — transactional email (`src/lib/email.ts`); the cron digest and team-notification emails no-op silently if `RESEND_API_KEY` is unset.
- `GOOGLE_PLACES_API_KEY` — server-side Places lookups for the "what's nearby" amenities pipeline.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — browser Maps/Street View key.
- `NEXT_PUBLIC_SITE_URL` — canonical site origin; falls back to `http://localhost:3600` in dev. Prefer `getBaseUrl()` (`src/lib/site.ts`) over this constant in server code that must work correctly on Vercel preview deployments.

## Architecture

### Routing & auth model

Next.js App Router under `src/app`, route groups `(auth)` (`/login`, `/signup`) and `(admin)` (`/admin/**`). **There is no `src/middleware.ts`.** All route protection is done per-route:
- Page/section access control lives in layout files that call `auth()` and `redirect()` directly — see `src/app/dashboard/layout.tsx` (requires `LISTER` or `ADMIN`) and `src/app/(admin)/admin/layout.tsx` (requires `VERIFIER` or `ADMIN`).
- Mutation-level checks use `src/lib/auth-guards.ts` (`requireVerifier`, `requireAdmin`) inside Server Actions, plus inline ownership checks (e.g. a lister can only edit/pay for their own listing).
- Auth itself is Auth.js v5 (`next-auth@5.0.0-beta.31`) with a single `Credentials` provider — phone-or-email + bcrypt password, JWT sessions, no OAuth providers wired up despite `BRIEF.md` mentioning Google as a future option. `role` (`Role` enum: `SEEKER | LISTER | VERIFIER | ADMIN`) and `phone` are threaded onto the JWT/session in `src/lib/auth.ts` callbacks and typed in `src/types/next-auth.d.ts`.

Mutations are almost entirely **Server Actions** (`actions.ts` files colocated with the route that uses them, e.g. `src/app/dashboard/listings/actions.ts`), not API routes. The `src/app/api/**` routes are reserved for things Server Actions can't do: the Auth.js catch-all handler, Cloudinary signed-upload endpoints, the Paystack webhook, and the daily cron.

### Data model (`prisma/schema.prisma`)

Single Postgres schema via Prisma. Key models and the relations between them:
- `User` — role-gated (`Role` enum), phone-unique, KYC fields (`idNumber`/`idVerifiedAt`), `bannedAt`/`banReason`, `planTier` (schema-only — `FREE` is the only tier actually enforced anywhere), `freeListingQuota` (default 20). A `LISTER` doubles as a property-manager microsite owner — `pmSlug`/`whatsappPhone`/`whatsappEnabled`/`pmBio` live on `User` rather than a separate PM entity.
- `Listing` — the core object. `status` is a 9-state enum (`DRAFT → SUBMITTED → IN_VERIFICATION → NEEDS_INFO/REJECTED → LIVE → TAKEN/EXPIRED/SUSPENDED`). **`publishedAt` is set once on first successful publish and never cleared** — it's the flag that prevents a listing from being charged the KES-99 listing fee twice on resubmission after edits/`NEEDS_INFO`. `lat`/`lng`/`geocodedAt` and `amenitiesSnapshot`/`amenitiesFetchedAt` (JSON, TTL'd cache of a Google Places "what's nearby" lookup — never call Places live per page view) back the maps/neighborhood-intel feature from `docs/V2_UPGRADE_BRIEF.md` §1/§4.
- `Verification` — append-only audit trail of admin/verifier review actions against a listing (not a mutable status field).
- `Unlock` — unique per `(userId, listingId)`, optionally linked 1:1 to the `Payment` that paid for it (a `TEAM`/comp unlock can exist with no payment).
- `Payment` — `provider` (`PAYSTACK | MPESA`, though only Paystack is actually implemented — see below), `purpose` (`UNLOCK | BUNDLE | FEATURED | SUBSCRIPTION | LISTING_FEE`; `BUNDLE`/`FEATURED`/`SUBSCRIPTION` are schema-only placeholders with no supporting logic yet).
- `TourSlot`/`TourRequest` — PM-published video-call availability vs. ad-hoc tour requests; a `TourRequest` only has a `slotId` when it was booked against a published `TourSlot`.
- `RentalApplication`, `MediaRequest`, `CareerApplication`, `Report`, `SavedListing`, `SavedSearch` (JSON `filtersJson` + `alertsEnabled` for the cron digest) round out the model.

Prisma client singleton: `src/lib/prisma.ts` (standard Next.js dev-hot-reload-safe pattern).

### Payments (Paystack)

`src/lib/paystack.ts` is a hand-rolled `fetch` client (no SDK dependency) for `initializeTransaction`/`verifyTransaction`/`verifyWebhookSignature` (HMAC-SHA512, timing-safe compare). Two independent paths can confirm the same payment — the hosted-checkout redirect (`src/app/payments/callback/route.ts`) and the async webhook (`src/app/api/paystack/webhook/route.ts`) — so all finalization goes through the single idempotent `finalizeSuccessfulPayment()` in `src/lib/unlock.ts`, which no-ops if the payment is already `SUCCESS`. It dispatches on `Payment.purpose`: `UNLOCK` upserts an `Unlock`; `LISTING_FEE` publishes the paid listing (sets `status: SUBMITTED`, `publishedAt: now`) — this is the over-quota (`freeListingQuota`) payment gate from `docs/V2_UPGRADE_BRIEF.md` §14. Follow this same "either path can win the race, make finalization idempotent" pattern for any new payment purpose.

### Search (`src/lib/search.ts`)

`parseFilters()`/`buildWhere()`/`orderBy()` build a Prisma query from URL search params. Notable ranking rule: **featured listings sort first, then verified-before-unverified, then newest** — unverified listings never outrank verified ones just by being newer (`FEATURED_FIRST`/`verifiedFirst` in `orderBy()`). `featuredUntil` is not re-checked against "now" in the query (Prisma `orderBy` can't express that) — an expired feature keeps sorting first until an admin clears/renews it; a known, accepted simplification. The Student Housing Hub (`searchNearCampus`) is a separate code path: a lat/lng bounding-box Prisma prefilter, then exact haversine distance + sort done in JS (no PostGIS in this stack) — proximity sort replaces the normal featured/verified ordering there since proximity is the point.

### Media (Cloudinary)

`src/lib/cloudinary.ts` is also a hand-rolled `fetch` client, not the Cloudinary SDK — signs upload params server-side (`/api/cloudinary/sign*` routes hand a short-lived signature to the browser upload widget) so secrets never reach the client. Three separate folders by purpose: `nyoomba/listings`, `nyoomba/verification-evidence`, `nyoomba/applications` — keep new upload types in their own folder rather than reusing one of these.

### Rate limiting

`src/lib/rate-limit.ts` is an **in-memory, per-server-instance** token bucket — there is no Redis/Upstash configured. On Vercel this only caps abuse per warm serverless instance, not globally. Known limitation, tracked in `AUDIT.md` (Milestone F1) rather than something to silently "fix" by adding infra unprompted.

### Design system

Tailwind v4 with CSS-variable/OKLCH tokens in `src/app/globals.css` (`@theme inline` block) — a deep forest-green primary + warm off-white background + a sparingly-used `gold` accent token. Geist Sans for body text, a serif `--font-display` (Fraunces) for headings. The shadcn component set under `src/components/ui` is intentionally minimal (`button`, `badge`, `card`, `input`, `label`, `select`, `textarea` — configured via `components.json`, style `radix-nova`); everything else (map view, listing cards, search filters, image uploader, admin panels) is bespoke composition on those primitives, organized by domain under `src/components/<domain>` (`listing`, `search`, `admin`, `dashboard`, `pm`, `pwa`, etc.) mirroring the route structure under `src/app`.

### Conventions worth matching

- Comments in this codebase explain *why*, not *what* — a decision, a race condition being guarded against, a deliberate simplification with a pointer to where it's tracked (e.g. `AUDIT.md`/`docs/V2_UPGRADE_BRIEF.md`). Match that style rather than restating what the code obviously does.
- Business-rule invariants are enforced server-side only and re-derived rather than cached where possible — e.g. free-listing-quota usage is *counted* from `Listing.publishedAt` at check time rather than stored as a running tally, specifically so it can't drift out of sync (see the comment on `User.freeListingQuota` in `prisma/schema.prisma`).
- When a normalizer/guard fixes bad data (e.g. `src/lib/listing-title.ts` collapsing a duplicated property-type token like "Bedsitter Bedsitter"), it's applied both at the write path and again at render as a display-time safety net — don't remove the render-time guard when "fixing" the root cause elsewhere.

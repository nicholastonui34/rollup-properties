import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PROPERTY_TYPE_LABELS, UNLOCK_PRICE_KES, STALE_AFTER_DAYS, listingStatusLabel } from "@/lib/listing-options";
import { normalizeListingTitle } from "@/lib/listing-title";
import { displayPhone } from "@/lib/phone";
import { LocationSection } from "@/components/listing/location-section";
import { PhotoGallery } from "@/components/listing/photo-gallery";
import { getAmenitiesSnapshot } from "@/lib/places";
import { nearestUniversityWithin, CROSS_LINK_RADIUS_KM } from "@/lib/universities";
import { daysSince } from "@/lib/dates";
import { SITE_URL } from "@/lib/site";
import { initiateUnlockAction } from "./unlock-actions";
import { UnlockDialog } from "@/components/listing/unlock-dialog";
import { BookTourDialog } from "@/components/listing/book-tour-dialog";
import { RealtorLink } from "@/components/listing/realtor-link";
import { FavoriteButton } from "@/components/listing/favorite-button";
import { ReportButton } from "@/components/listing/report-button";
import { toggleFavoriteAction } from "@/app/favorites/actions";
import { reportListingAction } from "./report-actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await prisma.listing.findUnique({
    where: { slug },
    select: { title: true, description: true, propertyType: true },
  });
  if (!listing) return {};
  const title = normalizeListingTitle(listing.title, listing.propertyType);
  const description = listing.description.slice(0, 155);
  return {
    title,
    description,
    alternates: { canonical: `/listings/${slug}` },
    openGraph: { title, description, url: `${SITE_URL}/listings/${slug}` },
    twitter: { title, description },
  };
}

export default async function ListingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ unlocked?: string; unlock_failed?: string; reported?: string }>;
}) {
  const { slug } = await params;
  const { unlocked, unlock_failed, reported } = await searchParams;
  const session = await auth();

  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      lister: { select: { id: true, name: true, phone: true } },
      area: true,
    },
  });

  if (!listing) notFound();

  const isOwner = session?.user?.id === listing.listerId;
  const isAdmin = session?.user?.role === "ADMIN";
  // TAKEN/EXPIRED listings stay reachable via direct link for anyone (spec
  // §6) — only pre-publication/actioned states (draft, in review, rejected,
  // suspended) are hidden from the public entirely.
  const publiclyViewableWhenNotLive = listing.status === "TAKEN" || listing.status === "EXPIRED";
  if (listing.status !== "LIVE" && !publiclyViewableWhenNotLive && !isOwner && !isAdmin) notFound();

  const unlock =
    session?.user && !isOwner && !isAdmin
      ? await prisma.unlock.findUnique({
          where: { userId_listingId: { userId: session.user.id, listingId: listing.id } },
        })
      : null;
  const hasAccess = isOwner || isAdmin || Boolean(unlock);

  const favorite =
    session?.user && !isOwner
      ? await prisma.savedListing.findUnique({
          where: { userId_listingId: { userId: session.user.id, listingId: listing.id } },
        })
      : null;

  const title = normalizeListingTitle(listing.title, listing.propertyType);
  const amenities = listing.status === "LIVE" ? await getAmenitiesSnapshot(listing) : null;
  const nearestUniversity =
    listing.lat != null && listing.lng != null
      ? nearestUniversityWithin(listing.lat, listing.lng, CROSS_LINK_RADIUS_KM)
      : null;
  const cover = listing.images.find((i) => i.isCover) ?? listing.images[0];
  const gallery = listing.images.filter((i) => i.id !== cover?.id);
  const isVerified = Boolean(listing.verifiedAt);
  const confirmedDate = listing.lastConfirmedAt ?? listing.verifiedAt;
  const confirmedDaysAgo = confirmedDate ? daysSince(confirmedDate) : null;
  const isStale = confirmedDaysAgo != null && confirmedDaysAgo > STALE_AFTER_DAYS;

  const jsonLd =
    listing.status === "LIVE"
      ? {
          "@context": "https://schema.org",
          "@type": "RealEstateListing",
          "@id": `${SITE_URL}/listings/${listing.slug}`,
          url: `${SITE_URL}/listings/${listing.slug}`,
          name: title,
          description: listing.description,
          datePosted: listing.verifiedAt?.toISOString() ?? listing.createdAt.toISOString(),
          image: listing.images.map((i) => i.url),
          address: {
            "@type": "PostalAddress",
            streetAddress: listing.streetAddress,
            addressLocality: listing.estate ?? listing.area?.name ?? listing.town,
            addressRegion: listing.town,
            addressCountry: "KE",
          },
          ...(listing.lat != null && listing.lng != null
            ? { geo: { "@type": "GeoCoordinates", latitude: listing.lat, longitude: listing.lng } }
            : {}),
          numberOfRooms: listing.bedrooms,
          numberOfBathroomsTotal: listing.bathrooms,
          offers: {
            "@type": "Offer",
            price: listing.priceKes,
            priceCurrency: "KES",
            availability: "https://schema.org/InStock",
            businessFunction:
              listing.purpose === "RENT" ? "http://purl.org/goodrelations/v1#LeaseOut" : "http://purl.org/goodrelations/v1#Sell",
          },
        }
      : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-24 sm:px-6 sm:pb-8">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {listing.status !== "LIVE" && publiclyViewableWhenNotLive && (
        <div className="mb-6 rounded-lg bg-secondary px-4 py-2 text-sm text-secondary-foreground">
          This listing is no longer available —{" "}
          <strong>{listingStatusLabel(listing.status, listing.purpose).toLowerCase()}</strong>.
        </div>
      )}
      {listing.status !== "LIVE" && !publiclyViewableWhenNotLive && (
        <div className="mb-6 rounded-lg bg-secondary px-4 py-2 text-sm text-secondary-foreground">
          Preview only — this listing is <strong>{listing.status.replace("_", " ").toLowerCase()}</strong> and
          isn&apos;t publicly visible yet.
        </div>
      )}
      {unlocked === "1" && (
        <div className="mb-6 rounded-lg bg-primary/10 px-4 py-2 text-sm text-primary">
          Contact unlocked — the manager&apos;s details are below.
        </div>
      )}
      {unlock_failed === "1" && (
        <div className="mb-6 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          Payment didn&apos;t go through, so you haven&apos;t been charged. Try again below.
        </div>
      )}
      {reported === "1" && (
        <div className="mb-6 rounded-lg bg-secondary px-4 py-2 text-sm text-secondary-foreground">
          Thanks — we&apos;ve flagged this listing for review.{" "}
          <Link href="/my-reports" className="font-medium underline underline-offset-2">
            Track your report
          </Link>
        </div>
      )}

      {/* Tour/video leads the page, ranked above photos (spec: immersive media first). */}
      {(listing.tourEmbedUrl || listing.videoUrl) && (
        <div className="relative mb-2 aspect-video overflow-hidden rounded-2xl bg-muted">
          <iframe
            src={listing.tourEmbedUrl ?? listing.videoUrl ?? undefined}
            title={listing.tourEmbedUrl ? `${title} — 3D tour` : `${title} — video tour`}
            loading="lazy"
            allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        </div>
      )}

      {listing.images.length > 0 ? (
        <PhotoGallery
          images={[cover, ...gallery].filter((img): img is NonNullable<typeof img> => Boolean(img))}
          title={title}
          priority={!listing.tourEmbedUrl && !listing.videoUrl}
        />
      ) : !listing.tourEmbedUrl && !listing.videoUrl ? (
        <div className="flex aspect-video items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground">
          No photos yet
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isVerified ? (
                  <Badge
                    title="Nyoomba confirmed this listing's photos, address and ownership before it went live."
                  >
                    Verified {listing.verifiedAt!.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </Badge>
                ) : null}
                {isVerified && confirmedDaysAgo != null && (
                  <span className={`text-xs ${isStale ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground"}`}>
                    {confirmedDaysAgo === 0 ? "Confirmed today" : `Confirmed ${confirmedDaysAgo}d ago`}
                  </span>
                )}
                {!isVerified && (
                  <Badge
                    variant="outline"
                    title="This listing hasn't completed Nyoomba's photo, address and ownership check yet."
                  >
                    Not yet verified
                  </Badge>
                )}
                <Badge variant="secondary">{PROPERTY_TYPE_LABELS[listing.propertyType]}</Badge>
              </div>
              {!isOwner && (
                <FavoriteButton
                  action={toggleFavoriteAction.bind(null, listing.id, `/listings/${listing.slug}`)}
                  saved={Boolean(favorite)}
                />
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {isVerified
                ? "Verified means Nyoomba confirmed this listing's photos, address and ownership before it went live."
                : "This listing hasn't completed Nyoomba's photo, address and ownership check yet — proceed with extra caution."}
            </p>
            <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {listing.streetAddress}
              {listing.estate ? `, ${listing.estate}` : ""}
              {listing.area ? `, ${listing.area.name}` : ""}, {listing.town}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-xl border border-border bg-card px-4 py-3 text-sm">
            <span><strong className="text-foreground">{listing.bedrooms}</strong> bed</span>
            <span><strong className="text-foreground">{listing.bathrooms}</strong> bath</span>
            <span className="text-foreground">{listing.furnished ? "Furnished" : "Unfurnished"}</span>
            <span className="text-foreground">
              Size: {listing.sizeSqm != null ? `${listing.sizeSqm} sqm` : "Not provided"}
            </span>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-foreground">Description</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-muted-foreground">
              {listing.description}
            </p>
          </div>

          {listing.amenities.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground">Amenities</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {listing.amenities.map((a) => (
                  <Badge key={a} variant="outline">{a}</Badge>
                ))}
              </div>
            </div>
          )}

          {listing.lat != null && listing.lng != null && (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-foreground">Location</h2>
              {nearestUniversity && (
                <Link
                  href={`/search?purpose=RENT&university=${nearestUniversity.slug}`}
                  className="mb-3 flex items-center justify-between gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm text-secondary-foreground hover:underline"
                >
                  <span>
                    Near {nearestUniversity.name} — explore the Student Housing Hub
                  </span>
                  <span aria-hidden="true">→</span>
                </Link>
              )}
              <LocationSection lat={listing.lat} lng={listing.lng} label={title} amenities={amenities} />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="font-display text-2xl font-semibold text-foreground">
              KES {listing.priceKes.toLocaleString()}
              {listing.purpose === "RENT" && <span className="text-sm font-normal text-muted-foreground">/month</span>}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Deposit:{" "}
              {listing.depositKes != null ? `KES ${listing.depositKes.toLocaleString()}` : "Not provided"}
            </p>
            <p className="text-sm text-muted-foreground">
              Service charge:{" "}
              {listing.serviceChargeKes != null
                ? `KES ${listing.serviceChargeKes.toLocaleString()}/mo`
                : "Not provided"}
            </p>

            <div id="contact-card" className="mt-5 rounded-xl border border-dashed border-border bg-muted/40 p-4 text-center">
              {hasAccess ? (
                <>
                  <p className="text-sm font-medium text-foreground">{listing.lister.name}</p>
                  <p className="text-sm text-muted-foreground">{displayPhone(listing.lister.phone)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isOwner
                      ? "This is your listing."
                      : isAdmin && !unlock
                        ? "Visible to admins."
                        : "Unlocked."}
                  </p>
                  {unlock && (
                    <Link href="/unlocks" className="mt-1 inline-block text-xs font-medium text-primary hover:underline">
                      View receipt
                    </Link>
                  )}
                  {listing.managerWebsiteUrl && listing.managerAgencyName && (
                    <div>
                      <RealtorLink
                        url={listing.managerWebsiteUrl}
                        agencyName={listing.managerAgencyName}
                        listingId={listing.id}
                      />
                    </div>
                  )}
                </>
              ) : listing.status !== "LIVE" ? (
                <>
                  <p className="text-sm font-medium text-foreground">Contact unavailable</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This listing is no longer accepting new contact unlocks.
                  </p>
                </>
              ) : session?.user ? (
                <>
                  <p className="text-sm font-medium text-foreground">Manager contact locked</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Pay a small one-time fee to reveal the direct phone number — no broker
                    fees.
                  </p>
                  <UnlockDialog
                    action={initiateUnlockAction.bind(null, listing.id)}
                    priceKes={UNLOCK_PRICE_KES}
                    verifiedDateLabel={listing.verifiedAt!.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                    confirmedDaysAgo={confirmedDaysAgo}
                    isStale={isStale}
                  />
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">Manager contact locked</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Log in and pay a small one-time fee to reveal the direct phone number — no
                    broker fees.
                  </p>
                  <Button asChild size="lg" className="mt-3 w-full">
                    <Link href="/login">Log in to unlock</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {!isOwner && listing.status === "LIVE" && (
            hasAccess ? (
              <BookTourDialog listingId={listing.id} className="hidden w-full sm:flex" />
            ) : (
              <Button asChild variant="outline" size="lg" className="hidden w-full sm:flex">
                <a href="#contact-card">Unlock contact to book a tour</a>
              </Button>
            )
          )}

          {isOwner && (
            <Button asChild variant="outline" className="w-full">
              <Link href={`/dashboard/listings/${listing.id}/edit`}>Edit listing</Link>
            </Button>
          )}

          {!isOwner && !isAdmin && listing.status === "LIVE" && (
            <div className="text-center">
              <ReportButton
                action={reportListingAction.bind(null, listing.id)}
                loggedIn={Boolean(session?.user)}
              />
            </div>
          )}
        </div>
      </div>

      {!isOwner && listing.status === "LIVE" && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border bg-background p-3 shadow-lg sm:hidden">
          {hasAccess ? (
            <BookTourDialog listingId={listing.id} className="flex-1" />
          ) : (
            <Button asChild size="lg" variant="outline" className="flex-1">
              <a href="#contact-card">Book a Tour</a>
            </Button>
          )}
          <Button asChild size="lg" className="flex-1">
            <a href="#contact-card">Contact</a>
          </Button>
        </div>
      )}
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PROPERTY_TYPE_LABELS, UNLOCK_PRICE_KES, listingStatusLabel } from "@/lib/listing-options";
import { displayPhone } from "@/lib/phone";
import { SITE_URL } from "@/lib/site";
import { initiateUnlockAction } from "./unlock-actions";
import { UnlockButton } from "@/components/listing/unlock-button";
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
  const listing = await prisma.listing.findUnique({ where: { slug }, select: { title: true, description: true } });
  if (!listing) return {};
  const description = listing.description.slice(0, 155);
  return {
    title: listing.title,
    description,
    alternates: { canonical: `/listings/${slug}` },
    openGraph: { title: listing.title, description, url: `${SITE_URL}/listings/${slug}` },
    twitter: { title: listing.title, description },
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

  const cover = listing.images.find((i) => i.isCover) ?? listing.images[0];
  const gallery = listing.images.filter((i) => i.id !== cover?.id);
  const isVerified = Boolean(listing.verifiedAt);

  const jsonLd =
    listing.status === "LIVE"
      ? {
          "@context": "https://schema.org",
          "@type": "RealEstateListing",
          "@id": `${SITE_URL}/listings/${listing.slug}`,
          url: `${SITE_URL}/listings/${listing.slug}`,
          name: listing.title,
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
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
          Thanks — we&apos;ve flagged this listing for review.
        </div>
      )}

      {/* Tour/video leads the page, ranked above photos (spec: immersive media first). */}
      {(listing.tourEmbedUrl || listing.videoUrl) && (
        <div className="relative mb-2 aspect-video overflow-hidden rounded-2xl bg-muted">
          <iframe
            src={listing.tourEmbedUrl ?? listing.videoUrl ?? undefined}
            title={listing.tourEmbedUrl ? `${listing.title} — 3D tour` : `${listing.title} — video tour`}
            loading="lazy"
            allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        </div>
      )}

      {listing.images.length > 0 ? (
        <>
          {/* Mobile: swipeable carousel showing every photo (CSS scroll-snap, no JS). */}
          <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto rounded-2xl sm:hidden">
            {[cover, ...gallery].map((img, idx) =>
              img ? (
                <div
                  key={img.id}
                  className="relative aspect-video w-full flex-none snap-center overflow-hidden rounded-2xl"
                >
                  <Image
                    src={img.url}
                    alt={idx === 0 ? listing.title : ""}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority={idx === 0 && !listing.tourEmbedUrl && !listing.videoUrl}
                    loading={idx === 0 ? undefined : "lazy"}
                  />
                </div>
              ) : null
            )}
          </div>

          {/* Tablet/desktop: hero + grid of 4. */}
          <div className="hidden grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl sm:grid">
            <div className="relative col-span-2 row-span-2 aspect-video">
              {cover && (
                <Image
                  src={cover.url}
                  alt={listing.title}
                  fill
                  sizes="600px"
                  className="object-cover"
                  priority={!listing.tourEmbedUrl && !listing.videoUrl}
                />
              )}
            </div>
            {gallery.slice(0, 4).map((img) => (
              <div key={img.id} className="relative col-span-2 row-span-1 aspect-square">
                <Image src={img.url} alt="" fill sizes="300px" className="object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </>
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
                    title="Rollup confirmed this listing's photos, address and ownership before it went live."
                  >
                    Verified {listing.verifiedAt!.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    title="This listing hasn't completed Rollup's photo, address and ownership check yet."
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
                ? "Verified means Rollup confirmed this listing's photos, address and ownership before it went live."
                : "This listing hasn't completed Rollup's photo, address and ownership check yet — proceed with extra caution."}
            </p>
            <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {listing.title}
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

            <div className="mt-5 rounded-xl border border-dashed border-border bg-muted/40 p-4 text-center">
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
                  <form action={initiateUnlockAction.bind(null, listing.id)}>
                    <UnlockButton priceKes={UNLOCK_PRICE_KES} />
                  </form>
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
    </div>
  );
}

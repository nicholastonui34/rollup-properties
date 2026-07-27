import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { ContactSheet } from "@/components/listing/contact-sheet";
import { BookTourDialog } from "@/components/listing/book-tour-dialog";
import { ApplicationForm } from "@/components/pm/application-form";
import { Button } from "@/components/ui/button";
import { normalizeListingTitle } from "@/lib/listing-title";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pm = await prisma.user.findUnique({ where: { pmSlug: slug }, select: { name: true } });
  if (!pm) return {};
  return { title: `${pm.name} — Property Manager` };
}

export default async function PmMicrositePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ listing?: string }>;
}) {
  const { slug } = await params;
  const { listing: listingId } = await searchParams;
  const session = await auth();

  const pm = await prisma.user.findUnique({
    where: { pmSlug: slug },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      pmBio: true,
      idVerifiedAt: true,
      bannedAt: true,
      whatsappPhone: true,
      whatsappEnabled: true,
    },
  });
  if (!pm || pm.role !== "LISTER" || pm.bannedAt) notFound();

  // Deep-linking /pm/[slug] is always allowed, but a ?listing= pin only
  // applies when the current session genuinely unlocked that listing from
  // this PM — otherwise it's silently dropped rather than 404ing the page.
  let pinnedListing = null;
  if (listingId && session?.user) {
    const unlock = await prisma.unlock.findUnique({
      where: { userId_listingId: { userId: session.user.id, listingId } },
    });
    if (unlock) {
      pinnedListing = await prisma.listing.findFirst({
        where: { id: listingId, listerId: pm.id },
        include: { images: { orderBy: { position: "asc" }, take: 6 } },
      });
    }
  }

  const [otherListings, availableSlots] = await Promise.all([
    prisma.listing.findMany({
      where: {
        listerId: pm.id,
        status: "LIVE",
        ...(pinnedListing ? { id: { not: pinnedListing.id } } : {}),
      },
      include: { images: { where: { isCover: true }, take: 1 } },
      orderBy: { verifiedAt: "desc" },
      take: 12,
    }),
    prisma.tourSlot.findMany({
      where: { pmId: pm.id, isBooked: false, startsAt: { gt: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 20,
    }),
  ]);

  const serviceAreas = Array.from(
    new Set([...otherListings, ...(pinnedListing ? [pinnedListing] : [])].map((l) => l.town))
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-semibold text-foreground">{pm.name}</h1>
          {pm.idVerifiedAt && (
            <Badge className="gap-1">
              <BadgeCheck className="size-3.5" aria-hidden="true" />
              ID verified
            </Badge>
          )}
        </div>
        {pm.pmBio && <p className="mt-2 text-sm text-muted-foreground">{pm.pmBio}</p>}
        {serviceAreas.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">Serving: {serviceAreas.join(", ")}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <ContactSheet
            phone={pm.phone}
            whatsappPhone={pm.whatsappPhone ?? pm.phone}
            whatsappEnabled={pm.whatsappEnabled}
            pmName={pm.name}
            listingTitle={pinnedListing ? pinnedListing.title : "your listings"}
            listingCode={pinnedListing ? pinnedListing.id.slice(-6).toUpperCase() : "N/A"}
            listingId={pinnedListing?.id ?? "none"}
            trigger={<Button size="lg">Contact {pm.name.split(" ")[0]}</Button>}
          />
          {pinnedListing ? (
            <BookTourDialog
              listingId={pinnedListing.id}
              pmSlug={slug}
              userId={session?.user?.id}
              availableSlots={availableSlots.map((s) => ({ id: s.id, startsAt: s.startsAt.toISOString() }))}
              triggerVariant="outline"
            />
          ) : (
            <p className="flex items-center text-xs text-muted-foreground">
              Unlock one of the listings below to book a tour.
            </p>
          )}
        </div>
      </div>

      {pinnedListing && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            You&apos;re applying for
          </p>
          <Link
            href={`/listings/${pinnedListing.slug}`}
            className="mt-1 block font-display text-xl font-semibold text-foreground hover:underline"
          >
            {normalizeListingTitle(pinnedListing.title, pinnedListing.propertyType)}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            {pinnedListing.town}
            {pinnedListing.estate ? ` · ${pinnedListing.estate}` : ""} · KES{" "}
            {pinnedListing.priceKes.toLocaleString()}
            {pinnedListing.purpose === "RENT" ? "/mo" : ""}
          </p>
          {pinnedListing.images.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {pinnedListing.images.map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-lg">
                  <Image src={img.url} alt="" fill sizes="120px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {otherListings.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            {pinnedListing ? "Other listings by this manager" : "Listings"}
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {otherListings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.slug}`}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="relative aspect-video bg-muted">
                  {listing.images[0] && (
                    <Image src={listing.images[0].url} alt="" fill sizes="400px" className="object-cover" />
                  )}
                </div>
                <div className="p-3">
                  <p className="line-clamp-1 text-sm font-medium text-foreground">
                    {normalizeListingTitle(listing.title, listing.propertyType)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {listing.town} · KES {listing.priceKes.toLocaleString()}
                    {listing.purpose === "RENT" ? "/mo" : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {session?.user ? (
        <ApplicationForm pmSlug={slug} pmId={pm.id} listingId={pinnedListing?.id} />
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">Log in to submit a rental application.</p>
          <Button asChild className="mt-3">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

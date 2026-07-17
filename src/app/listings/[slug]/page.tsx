import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PROPERTY_TYPE_LABELS, UNLOCK_PRICE_KES } from "@/lib/listing-options";
import { displayPhone } from "@/lib/phone";
import { initiateUnlockAction } from "./unlock-actions";
import { UnlockButton } from "@/components/listing/unlock-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await prisma.listing.findUnique({ where: { slug }, select: { title: true, description: true } });
  if (!listing) return {};
  return { title: listing.title, description: listing.description.slice(0, 155) };
}

export default async function ListingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ unlocked?: string; unlock_failed?: string }>;
}) {
  const { slug } = await params;
  const { unlocked, unlock_failed } = await searchParams;
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
  if (listing.status !== "LIVE" && !isOwner && !isAdmin) notFound();

  const unlock =
    session?.user && !isOwner && !isAdmin
      ? await prisma.unlock.findUnique({
          where: { userId_listingId: { userId: session.user.id, listingId: listing.id } },
        })
      : null;
  const hasAccess = isOwner || isAdmin || Boolean(unlock);

  const cover = listing.images.find((i) => i.isCover) ?? listing.images[0];
  const gallery = listing.images.filter((i) => i.id !== cover?.id);
  const isVerified = Boolean(listing.verifiedAt);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {listing.status !== "LIVE" && (
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

      {listing.images.length > 0 ? (
        <div className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
          <div className="relative col-span-4 row-span-2 aspect-video sm:col-span-2 sm:row-span-2">
            {cover && <Image src={cover.url} alt={listing.title} fill sizes="600px" className="object-cover" priority />}
          </div>
          {gallery.slice(0, 4).map((img) => (
            <div key={img.id} className="relative col-span-2 row-span-1 hidden aspect-square sm:block">
              <Image src={img.url} alt="" fill sizes="300px" className="object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground">
          No photos yet
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {isVerified ? (
                <Badge>
                  Verified {listing.verifiedAt!.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                </Badge>
              ) : (
                <Badge variant="outline">Not yet verified</Badge>
              )}
              <Badge variant="secondary">{PROPERTY_TYPE_LABELS[listing.propertyType]}</Badge>
            </div>
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
            {listing.depositKes != null && (
              <p className="mt-1 text-sm text-muted-foreground">
                Deposit: KES {listing.depositKes.toLocaleString()}
              </p>
            )}
            {listing.serviceChargeKes != null && (
              <p className="text-sm text-muted-foreground">
                Service charge: KES {listing.serviceChargeKes.toLocaleString()}/mo
              </p>
            )}

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
        </div>
      </div>
    </div>
  );
}

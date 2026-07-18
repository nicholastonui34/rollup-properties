import Link from "next/link";
import Image from "next/image";
import { Bell } from "lucide-react";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmSubmitButton } from "@/components/listing/confirm-submit-button";
import { KycCard } from "@/components/dashboard/kyc-card";
import {
  deleteListingAction,
  renewListingAction,
  submitListingAction,
  unpublishListingAction,
} from "@/app/dashboard/listings/actions";
import {
  LISTING_STATUS_BADGE_VARIANT,
  LISTING_STATUS_LABELS,
  MIN_LISTING_PHOTOS,
} from "@/lib/listing-options";
import { isPast } from "@/lib/dates";

export const metadata: Metadata = { title: "Your listings" };

export default async function DashboardPage() {
  const session = await auth();
  const [user, listings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session!.user.id },
      select: { idNumber: true, idVerifiedAt: true },
    }),
    prisma.listing.findMany({
      where: { listerId: session!.user.id },
      include: {
        images: { where: { isCover: true }, take: 1 },
        _count: { select: { images: true, unlocks: true } },
        verifications: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Your listings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit and track verification status.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/listings/new">New listing</Link>
        </Button>
      </div>

      {session?.user.role === "LISTER" && (
        <KycCard idNumber={user?.idNumber ?? null} idVerifiedAt={user?.idVerifiedAt ?? null} />
      )}

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            You haven&apos;t listed a property yet.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/listings/new">Create your first listing</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {listings.map((listing) => {
            const cover = listing.images[0];
            const canSubmit =
              listing.status === "DRAFT" ||
              listing.status === "NEEDS_INFO" ||
              listing.status === "REJECTED";
            return (
              <div
                key={listing.id}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="relative aspect-video bg-muted">
                  {cover ? (
                    <Image src={cover.url} alt="" fill sizes="400px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No photos yet
                    </div>
                  )}
                  <Badge
                    className="absolute left-2 top-2"
                    variant={LISTING_STATUS_BADGE_VARIANT[listing.status]}
                  >
                    {LISTING_STATUS_LABELS[listing.status]}
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-1 font-semibold text-foreground">{listing.title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {listing.town}
                    {listing.estate ? ` · ${listing.estate}` : ""} · KES{" "}
                    {listing.priceKes.toLocaleString()}
                    {listing.purpose === "RENT" ? "/mo" : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {listing._count.images} photo{listing._count.images === 1 ? "" : "s"}
                    {listing._count.images < MIN_LISTING_PHOTOS &&
                      ` (need ${MIN_LISTING_PHOTOS - listing._count.images} more to submit)`}
                  </p>
                  {listing.status === "LIVE" && listing.expiresAt && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {isPast(listing.expiresAt) ? "Expired" : "Expires"}{" "}
                      {listing.expiresAt.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                  {(listing.status === "NEEDS_INFO" || listing.status === "REJECTED") &&
                    listing.verifications[0]?.notes && (
                      <p className="mt-2 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive">
                        {listing.verifications[0].notes}
                      </p>
                    )}
                  {listing._count.unlocks > 0 && (
                    <Link
                      href={`/dashboard/listings/${listing.id}/leads`}
                      className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <Bell className="size-3.5" />
                      {listing._count.unlocks} {listing._count.unlocks === 1 ? "person has" : "people have"} unlocked
                      your contact
                    </Link>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/listings/${listing.id}/edit`}>Edit</Link>
                    </Button>
                    {listing.status === "LIVE" && (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/listings/${listing.slug}`}>View live</Link>
                      </Button>
                    )}
                    {canSubmit && (
                      <form action={submitListingAction.bind(null, listing.id)}>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={listing._count.images < MIN_LISTING_PHOTOS}
                        >
                          Submit for verification
                        </Button>
                      </form>
                    )}
                    {listing.status === "LIVE" && (
                      <form action={renewListingAction.bind(null, listing.id)}>
                        <Button type="submit" size="sm" variant="outline">
                          Renew 30 days
                        </Button>
                      </form>
                    )}
                    {listing.status === "LIVE" && (
                      <form action={unpublishListingAction.bind(null, listing.id)}>
                        <ConfirmSubmitButton
                          type="submit"
                          size="sm"
                          variant="outline"
                          confirmMessage="Mark this listing as taken/unpublished?"
                        >
                          Mark as taken
                        </ConfirmSubmitButton>
                      </form>
                    )}
                    <form action={deleteListingAction.bind(null, listing.id)}>
                      <ConfirmSubmitButton
                        type="submit"
                        size="sm"
                        variant="destructive"
                        confirmMessage="Delete this listing and all its photos? This can't be undone."
                      >
                        Delete
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

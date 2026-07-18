import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListingForm } from "@/components/listing/listing-form";
import { ImageUploader } from "@/components/listing/image-uploader";
import { updateListingAction, submitListingAction } from "@/app/dashboard/listings/actions";
import {
  LISTING_STATUS_BADGE_VARIANT,
  listingStatusLabel,
  MIN_LISTING_PHOTOS,
} from "@/lib/listing-options";

export const metadata: Metadata = { title: "Edit listing" };

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const [listing, areas] = await Promise.all([
    prisma.listing.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" } } },
    }),
    prisma.area.findMany({
      orderBy: [{ town: "asc" }, { name: "asc" }],
      select: { id: true, name: true, town: true },
    }),
  ]);

  if (!session?.user) redirect("/login");
  if (!listing) notFound();
  if (listing.listerId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const canSubmit =
    listing.status === "DRAFT" || listing.status === "NEEDS_INFO" || listing.status === "REJECTED";
  const enoughPhotos = listing.images.length >= MIN_LISTING_PHOTOS;

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
          ← Your listings
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {listing.title}
          </h1>
          <Badge variant={LISTING_STATUS_BADGE_VARIANT[listing.status]}>
            {listingStatusLabel(listing.status, listing.purpose)}
          </Badge>
        </div>
      </div>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <ImageUploader listingId={listing.id} images={listing.images} />
        {canSubmit && (
          <form action={submitListingAction.bind(null, listing.id)}>
            <Button type="submit" disabled={!enoughPhotos}>
              Submit for verification
            </Button>
            {!enoughPhotos && (
              <p className="mt-2 text-xs text-muted-foreground">
                Add {MIN_LISTING_PHOTOS - listing.images.length} more photo
                {MIN_LISTING_PHOTOS - listing.images.length === 1 ? "" : "s"} to submit.
              </p>
            )}
          </form>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold text-foreground">Listing details</h2>
        <ListingForm
          action={updateListingAction.bind(null, listing.id)}
          areas={areas}
          submitLabel="Save changes"
          listing={{
            title: listing.title,
            description: listing.description,
            purpose: listing.purpose,
            propertyType: listing.propertyType,
            priceKes: listing.priceKes,
            depositKes: listing.depositKes,
            serviceChargeKes: listing.serviceChargeKes,
            sizeSqm: listing.sizeSqm,
            tourEmbedUrl: listing.tourEmbedUrl,
            videoUrl: listing.videoUrl,
            areaId: listing.areaId,
            estate: listing.estate,
            streetAddress: listing.streetAddress,
            bedrooms: listing.bedrooms,
            bathrooms: listing.bathrooms,
            furnished: listing.furnished,
            amenities: listing.amenities,
          }}
        />
      </section>
    </div>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListingForm } from "@/components/listing/listing-form";
import { ImageUploader } from "@/components/listing/image-uploader";
import { BoostListingDialog } from "@/components/dashboard/boost-listing-dialog";
import { updateListingAction, submitListingAction } from "@/app/dashboard/listings/actions";
import {
  LISTING_STATUS_BADGE_VARIANT,
  listingStatusLabel,
  MIN_LISTING_PHOTOS,
} from "@/lib/listing-options";

export const metadata: Metadata = { title: "Edit listing" };

export default async function EditListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ published?: string; payment_failed?: string }>;
}) {
  const { id } = await params;
  const { published, payment_failed } = await searchParams;
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

      {published === "1" && (
        <div className="rounded-lg bg-primary/10 px-4 py-2 text-sm text-primary">
          Payment received — your listing is published and headed to verification.
        </div>
      )}
      {payment_failed === "1" && (
        <div className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          Payment didn&apos;t go through, so you haven&apos;t been charged. You can try again below.
        </div>
      )}

      {!canSubmit && listing.status !== "DRAFT" && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-border p-4">
          <p className="text-sm text-muted-foreground">Get more inquiries with professional photos or a video tour.</p>
          <BoostListingDialog
            listingId={listing.id}
            defaultLocation={[listing.streetAddress, listing.estate, listing.town].filter(Boolean).join(", ")}
            triggerLabel="Boost this listing"
          />
        </div>
      )}

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
            managerAgencyName: listing.managerAgencyName,
            managerWebsiteUrl: listing.managerWebsiteUrl,
            areaId: listing.areaId,
            estate: listing.estate,
            streetAddress: listing.streetAddress,
            lat: listing.lat,
            lng: listing.lng,
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

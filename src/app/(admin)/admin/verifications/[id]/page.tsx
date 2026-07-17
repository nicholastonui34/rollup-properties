import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { VerificationReviewPanel } from "@/components/admin/verification-review-panel";
import { PROPERTY_TYPE_LABELS, LISTING_STATUS_BADGE_VARIANT, LISTING_STATUS_LABELS } from "@/lib/listing-options";
import { displayPhone } from "@/lib/phone";

export const metadata: Metadata = { title: "Review listing" };

const VERIFICATION_STATUS_BADGE = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  NEEDS_INFO: "destructive",
} as const;

export default async function AdminVerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      lister: { select: { name: true, phone: true, email: true, idNumber: true, idVerifiedAt: true, createdAt: true } },
      area: true,
      verifications: { orderBy: { createdAt: "desc" }, include: { verifier: { select: { name: true } } } },
    },
  });

  if (!listing) notFound();

  const canReview = ["SUBMITTED", "IN_VERIFICATION", "NEEDS_INFO"].includes(listing.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={LISTING_STATUS_BADGE_VARIANT[listing.status]}>
          {LISTING_STATUS_LABELS[listing.status]}
        </Badge>
        <Badge variant="secondary">{PROPERTY_TYPE_LABELS[listing.propertyType]}</Badge>
      </div>

      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {listing.title}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {listing.streetAddress}
          {listing.estate ? `, ${listing.estate}` : ""}
          {listing.area ? `, ${listing.area.name}` : ""}, {listing.town}
        </p>
        <p className="mt-1 text-sm text-foreground">
          KES {listing.priceKes.toLocaleString()}
          {listing.purpose === "RENT" ? "/month" : ""} · {listing.bedrooms} bed · {listing.bathrooms} bath
        </p>
      </div>

      {listing.images.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-2xl sm:grid-cols-4">
          {listing.images.map((img) => (
            <div key={img.id} className="relative aspect-square">
              <Image src={img.url} alt="" fill sizes="200px" className="object-cover" />
              {img.isCover && (
                <Badge className="absolute left-1.5 top-1.5" variant="default">
                  Cover
                </Badge>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground">
          No photos yet
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
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

          {listing.verifications.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground">Review history</h2>
              <div className="mt-2 space-y-2">
                {listing.verifications.map((v) => (
                  <div key={v.id} className="rounded-xl border border-border bg-card p-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={VERIFICATION_STATUS_BADGE[v.status]}>{v.status.replace("_", " ")}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {v.verifier.name} ·{" "}
                        {v.createdAt.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    {v.notes && <p className="mt-1.5 text-sm text-muted-foreground">{v.notes}</p>}
                    {v.evidenceUrls.length > 0 && (
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {v.evidenceUrls.map((url) => (
                          <div key={url} className="relative aspect-square overflow-hidden rounded-lg border border-border">
                            <Image src={url} alt="" fill sizes="100px" className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">Lister</h2>
            <p className="mt-2 text-sm text-foreground">{listing.lister.name}</p>
            <p className="text-sm text-muted-foreground">{displayPhone(listing.lister.phone)}</p>
            {listing.lister.email && <p className="text-sm text-muted-foreground">{listing.lister.email}</p>}
            <p className="mt-1 text-xs text-muted-foreground">
              Joined {listing.lister.createdAt.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            <div className="mt-3 border-t border-border pt-3">
              {listing.lister.idVerifiedAt ? (
                <Badge>ID verified</Badge>
              ) : listing.lister.idNumber ? (
                <Badge variant="secondary">ID submitted, unreviewed — see Lister KYC</Badge>
              ) : (
                <Badge variant="destructive">No ID on file</Badge>
              )}
            </div>
          </div>

          {canReview && <VerificationReviewPanel listingId={listing.id} status={listing.status} />}
        </div>
      </div>
    </div>
  );
}

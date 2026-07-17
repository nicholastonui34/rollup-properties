import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LISTING_STATUS_BADGE_VARIANT, LISTING_STATUS_LABELS } from "@/lib/listing-options";
import { displayPhone } from "@/lib/phone";
import { daysAgo } from "@/lib/dates";

export const metadata: Metadata = { title: "Verification queue" };

export default async function VerificationsQueuePage() {
  const [queue, needsReverification] = await Promise.all([
    prisma.listing.findMany({
      where: { status: { in: ["SUBMITTED", "IN_VERIFICATION", "NEEDS_INFO"] } },
      include: {
        images: { where: { isCover: true }, take: 1 },
        lister: { select: { name: true, phone: true, idNumber: true, idVerifiedAt: true } },
      },
      orderBy: { updatedAt: "asc" },
    }),
    prisma.listing.findMany({
      where: { status: "LIVE", verifiedAt: { lt: daysAgo(60) } },
      include: { lister: { select: { name: true } } },
      orderBy: { verifiedAt: "asc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Verification queue
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {queue.length} listing{queue.length === 1 ? "" : "s"} awaiting review.
        </p>

        {queue.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground">Queue is empty. Nice work.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {queue.map((listing) => {
              const cover = listing.images[0];
              return (
                <Link
                  key={listing.id}
                  href={`/admin/verifications/${listing.id}`}
                  className="flex gap-3 overflow-hidden rounded-2xl border border-border bg-card p-3 transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {cover ? (
                      <Image src={cover.url} alt="" fill sizes="80px" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={LISTING_STATUS_BADGE_VARIANT[listing.status]}>
                        {LISTING_STATUS_LABELS[listing.status]}
                      </Badge>
                      {listing.lister.idVerifiedAt ? (
                        <Badge variant="outline">Lister KYC ok</Badge>
                      ) : (
                        <Badge variant="destructive">Lister not KYC&apos;d</Badge>
                      )}
                    </div>
                    <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-foreground">
                      {listing.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {listing.town}
                      {listing.estate ? ` · ${listing.estate}` : ""} · KES {listing.priceKes.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {listing.lister.name} · {displayPhone(listing.lister.phone)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {needsReverification.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground">Flagged for re-verification</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Live listings verified more than 60 days ago — due for a refresh check.
          </p>
          <div className="mt-3 space-y-2">
            {needsReverification.map((listing) => (
              <div
                key={listing.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{listing.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Verified {listing.verifiedAt!.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })} · {listing.lister.name}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/verifications/${listing.id}`}>Review</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

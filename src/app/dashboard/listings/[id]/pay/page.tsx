import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { FREE_LISTING_QUOTA, LISTING_PUBLISH_FEE_KES } from "@/lib/listing-options";
import { submitListingAction } from "@/app/dashboard/listings/actions";
import { initiateListingPublishPaymentAction } from "./actions";

export const metadata: Metadata = { title: "Publish listing" };

export default async function PublishPaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ failed?: string }>;
}) {
  const { id } = await params;
  const { failed } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.listerId !== session.user.id) notFound();
  if (listing.publishedAt) redirect(`/dashboard/listings/${id}/edit`);

  const lister = await prisma.user.findUnique({ where: { id: session.user.id } });
  const publishedCount = await prisma.listing.count({
    where: { listerId: session.user.id, publishedAt: { not: null } },
  });
  const quota = lister?.freeListingQuota ?? FREE_LISTING_QUOTA;
  const stillFree = publishedCount < quota;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Publish &ldquo;{listing.title}&rdquo;
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {stillFree
            ? "You still have free listing slots available."
            : `You've used your ${quota} free listings. Publish this one for KES ${LISTING_PUBLISH_FEE_KES}.`}
        </p>
      </div>

      {failed === "1" && (
        <div className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          Payment didn&apos;t go through, so you haven&apos;t been charged. Try again below.
        </div>
      )}

      {stillFree ? (
        <form action={submitListingAction.bind(null, id)}>
          <Button type="submit" size="lg" className="w-full">
            Publish for free
          </Button>
        </form>
      ) : (
        <form action={initiateListingPublishPaymentAction.bind(null, id)}>
          <Button type="submit" size="lg" className="w-full">
            Pay KES {LISTING_PUBLISH_FEE_KES} &amp; publish
          </Button>
        </form>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Your listing is saved as a draft until payment completes — nothing is lost if you leave
        this page.
      </p>
    </div>
  );
}

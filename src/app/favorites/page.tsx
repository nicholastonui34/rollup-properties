import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listings/listing-card";
import { LISTING_CARD_SELECT } from "@/lib/search";

export const metadata: Metadata = { title: "Your favorites" };

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const saved = await prisma.savedListing.findMany({
    where: { userId: session.user.id },
    include: { listing: { select: LISTING_CARD_SELECT } },
    orderBy: { createdAt: "desc" },
  });

  const listings = saved.map((s) => s.listing);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Your favorites
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Listings you&apos;ve saved for later.
      </p>

      {listings.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">You haven&apos;t saved any listings yet.</p>
          <Link href="/search" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Browse verified listings
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} favorited path="/favorites" />
          ))}
        </div>
      )}
    </div>
  );
}

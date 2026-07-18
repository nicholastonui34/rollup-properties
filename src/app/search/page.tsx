import type { Metadata } from "next";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { ListingCard } from "@/components/listings/listing-card";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchToolbar } from "@/components/search/search-toolbar";
import { SearchPagination } from "@/components/search/pagination";
import { SaveSearchButton } from "@/components/search/save-search-button";
import { MapView } from "@/components/search/map-view";
import { parseFilters, searchListings, type RawSearchParams } from "@/lib/search";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Search verified properties",
  description:
    "Search verified rental and sale properties across Kenya with filters for price, bedrooms, amenities and more.",
  // Filtered/paginated results are thin, near-duplicate content — the indexable,
  // canonical SEO surface for area searches is the /rent/[area] and /sale/[area] landing pages.
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const filters = parseFilters(raw);
  const [{ listings, total, pageCount }, session] = await Promise.all([searchListings(filters), auth()]);

  const favoritedIds = session?.user
    ? new Set(
        (
          await prisma.savedListing.findMany({
            where: { userId: session.user.id, listingId: { in: listings.map((l) => l.id) } },
            select: { listingId: true },
          })
        ).map((s) => s.listingId)
      )
    : new Set<string>();

  const queryString = new URLSearchParams(
    Object.entries(raw).flatMap(([k, v]) =>
      v === undefined ? [] : (Array.isArray(v) ? v : [v]).map((val) => [k, val] as [string, string])
    )
  ).toString();

  const purposeLabel = filters.purpose === "SALE" ? "for sale" : filters.purpose === "RENT" ? "to rent" : "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {filters.q ? `Homes ${purposeLabel || "to rent"} in ${filters.q}` : `Verified homes ${purposeLabel}`.trim()}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every listing below is verified — real photos, real address, real manager.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <input type="checkbox" id="filters-toggle" className="peer sr-only" />
          <label
            htmlFor="filters-toggle"
            className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground lg:hidden"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="size-4" />
              Filters
            </span>
            <ChevronDown className="size-4 transition-transform [.peer:checked~label_&]:rotate-180" />
          </label>
          <div className="mt-3 hidden peer-checked:block lg:mt-0 lg:block">
            <SearchFilters filters={filters} />
          </div>
        </aside>

        <div>
          <SearchToolbar filters={filters} raw={raw} total={total} />
          {session?.user && (
            <div className="mt-3">
              <SaveSearchButton queryString={queryString} />
            </div>
          )}

          {listings.length === 0 ? (
            <div className="mt-10 flex flex-col items-center rounded-xl border border-dashed py-16 text-center">
              <p className="text-sm font-medium text-foreground">No listings match those filters</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try widening your price range or clearing a filter.
              </p>
            </div>
          ) : filters.view === "map" ? (
            <div className="mt-4">
              <MapView listings={listings} />
            </div>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    favorited={favoritedIds.has(listing.id)}
                    path={`/search?${queryString}`}
                  />
                ))}
              </div>
              <SearchPagination raw={raw} page={filters.page} pageCount={pageCount} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

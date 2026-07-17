import type { Metadata } from "next";
import { ListingCard } from "@/components/listings/listing-card";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchToolbar } from "@/components/search/search-toolbar";
import { SearchPagination } from "@/components/search/pagination";
import { MapView } from "@/components/search/map-view";
import { parseFilters, searchListings, type RawSearchParams } from "@/lib/search";

export const metadata: Metadata = {
  title: "Search verified properties",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const filters = parseFilters(raw);
  const { listings, total, pageCount } = await searchListings(filters);

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
          <SearchFilters filters={filters} />
        </aside>

        <div>
          <SearchToolbar filters={filters} raw={raw} total={total} />

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
                  <ListingCard key={listing.id} listing={listing} />
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

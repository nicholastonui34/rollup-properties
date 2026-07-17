import Link from "next/link";
import { notFound } from "next/navigation";
import type { ListingPurpose } from "@prisma/client";
import { ListingCard } from "@/components/listings/listing-card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, searchListings, type ParsedFilters } from "@/lib/search";

export async function getAreaOrNotFound(slug: string) {
  const area = await prisma.area.findUnique({ where: { slug } });
  if (!area) notFound();
  return area;
}

export async function AreaLanding({ areaSlug, purpose }: { areaSlug: string; purpose: ListingPurpose }) {
  const area = await getAreaOrNotFound(areaSlug);

  const filters: ParsedFilters = {
    purpose,
    areaSlug: area.slug,
    furnished: false,
    amenities: [],
    sort: "newest",
    page: 1,
    view: "grid",
  };

  const { listings, total } = await searchListings(filters);
  const verb = purpose === "RENT" ? "to rent" : "for sale";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Badge variant="secondary" className="mb-3">
        {area.town}
      </Badge>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Verified homes {verb} in {area.name}, {area.town}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {`Browse ${total} verified ${purpose === "RENT" ? "rental" : "sale"} listing${total === 1 ? "" : "s"} in ${area.name} — real photos, real addresses, honest prices. Pay a small fee to unlock the manager's direct contact, no broker fees.`}
      </p>

      {listings.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-xl border border-dashed py-16 text-center">
          <p className="text-sm font-medium text-foreground">No live listings in {area.name} yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            <Link href={`/search?purpose=${purpose}&town=${encodeURIComponent(area.town)}`} className="text-primary underline-offset-2 hover:underline">
              See {purpose === "RENT" ? "rentals" : "sales"} across {area.town}
            </Link>{" "}
            instead.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          {total > PAGE_SIZE && (
            <div className="mt-8 text-center">
              <Link
                href={`/search?purpose=${purpose}&area=${area.slug}`}
                className="text-sm font-medium text-primary underline-offset-2 hover:underline"
              >
                See all {total} listings in {area.name} →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

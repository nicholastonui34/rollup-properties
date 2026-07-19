import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PROPERTY_TYPE_LABELS, listingStatusLabel } from "@/lib/listing-options";
import { normalizeListingTitle } from "@/lib/listing-title";
import type { ListingCardData } from "@/lib/search";
import { toggleFavoriteAction } from "@/app/favorites/actions";
import { FavoriteButton } from "@/components/listing/favorite-button";
import { isPast, daysSince } from "@/lib/dates";
import { STALE_AFTER_DAYS } from "@/lib/listing-options";

export function ListingCard({
  listing,
  favorited = false,
  path = "/search",
}: {
  listing: ListingCardData;
  favorited?: boolean;
  path?: string;
}) {
  const cover = listing.images[0]?.url;
  const title = normalizeListingTitle(listing.title, listing.propertyType);
  const location = listing.area?.name ?? listing.estate ?? listing.town;
  const isVerified = Boolean(listing.verifiedAt);
  const isFeatured = Boolean(listing.featuredUntil && !isPast(listing.featuredUntil));
  const confirmedDate = listing.lastConfirmedAt ?? listing.verifiedAt;
  const confirmedDaysAgo = confirmedDate ? daysSince(confirmedDate) : null;
  const isStale = confirmedDaysAgo != null && confirmedDaysAgo > STALE_AFTER_DAYS;

  return (
    <Card className="overflow-hidden py-0 transition-shadow hover:shadow-md">
      <Link href={`/listings/${listing.slug}`} className="group block">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {cover ? (
            <Image
              src={cover}
              alt={title}
              fill
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              No photo
            </div>
          )}
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
            {isVerified && (
              <Badge className="gap-1 bg-gold text-gold-foreground hover:bg-gold">
                <ShieldCheck className="size-3" />
                Verified
              </Badge>
            )}
            {isFeatured && (
              <Badge className="gap-1" variant="default">
                <Sparkles className="size-3" />
                Featured
              </Badge>
            )}
          </div>
          <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
            <Badge variant="secondary">{listing.purpose === "RENT" ? "To rent" : "For sale"}</Badge>
            {listing.status !== "LIVE" && (
              <Badge variant="outline">{listingStatusLabel(listing.status, listing.purpose)}</Badge>
            )}
          </div>
          <FavoriteButton
            action={toggleFavoriteAction.bind(null, listing.id, path)}
            saved={favorited}
            variant="overlay"
            className="absolute bottom-2 right-2"
          />
        </div>

        <div className="space-y-1.5 p-4">
          <p className="font-display text-lg font-semibold tracking-tight text-foreground">
            KES {listing.priceKes.toLocaleString()}
            {listing.purpose === "RENT" && (
              <span className="text-sm font-normal text-muted-foreground"> /month</span>
            )}
          </p>
          <h3 className="truncate text-sm font-medium text-foreground">{title}</h3>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {location}, {listing.town}
          </p>
          {confirmedDaysAgo != null && (
            <p className={`text-xs ${isStale ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground"}`}>
              {confirmedDaysAgo === 0 ? "Confirmed today" : `Confirmed ${confirmedDaysAgo}d ago`}
            </p>
          )}
          <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
            <span>{PROPERTY_TYPE_LABELS[listing.propertyType]}</span>
            {listing.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <BedDouble className="size-3.5" />
                {listing.bedrooms}
              </span>
            )}
            {listing.bathrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bath className="size-3.5" />
                {listing.bathrooms}
              </span>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}

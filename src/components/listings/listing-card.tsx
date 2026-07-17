import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, MapPin, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PROPERTY_TYPE_LABELS } from "@/lib/listing-options";
import type { ListingCardData } from "@/lib/search";

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const cover = listing.images[0]?.url;
  const location = listing.area?.name ?? listing.estate ?? listing.town;
  const isVerified = Boolean(listing.verifiedAt);

  return (
    <Card className="overflow-hidden py-0 transition-shadow hover:shadow-md">
      <Link href={`/listings/${listing.slug}`} className="group block">
        <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
          {cover ? (
            <Image
              src={cover}
              alt={listing.title}
              fill
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              No photo
            </div>
          )}
          {isVerified && (
            <Badge className="absolute left-2 top-2 gap-1 bg-gold text-gold-foreground hover:bg-gold">
              <ShieldCheck className="size-3" />
              Verified
            </Badge>
          )}
          <Badge variant="secondary" className="absolute right-2 top-2">
            {listing.purpose === "RENT" ? "To rent" : "For sale"}
          </Badge>
        </div>

        <div className="space-y-1.5 p-4">
          <p className="font-display text-lg font-semibold tracking-tight text-foreground">
            KES {listing.priceKes.toLocaleString()}
            {listing.purpose === "RENT" && (
              <span className="text-sm font-normal text-muted-foreground"> /month</span>
            )}
          </p>
          <h3 className="truncate text-sm font-medium text-foreground">{listing.title}</h3>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {location}, {listing.town}
          </p>
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

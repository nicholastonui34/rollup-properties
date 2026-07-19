"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AmenityCategory } from "@/lib/places";

export function NearbyAmenities({
  categories,
  activeKey,
  onSelectCategory,
}: {
  categories: AmenityCategory[];
  activeKey: string;
  onSelectCategory: (key: string) => void;
}) {
  const active = categories.find((c) => c.key === activeKey) ?? categories[0];
  if (!active) return null;

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => onSelectCategory(c.key)}
            className={cn(
              "flex-none rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              c.key === active.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
        {active.items.map((item) => (
          <li key={item.placeId} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
            <span className="text-foreground">{item.name}</span>
            <span className="flex shrink-0 items-center gap-3 text-muted-foreground">
              {item.rating != null && (
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 fill-gold text-gold" />
                  {item.rating.toFixed(1)}
                </span>
              )}
              <span>{item.distanceKm < 1 ? `${Math.round(item.distanceKm * 1000)} m` : `${item.distanceKm.toFixed(1)} km`}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

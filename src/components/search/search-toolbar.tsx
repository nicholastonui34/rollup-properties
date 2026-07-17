"use client";

import Link from "next/link";
import { LayoutGrid, Map as MapIcon } from "lucide-react";
import type { ParsedFilters, RawSearchParams } from "@/lib/search";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "verified", label: "Recently verified" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

function buildQuery(raw: RawSearchParams, overrides: Record<string, string>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (key === "page") continue;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value) {
      params.set(key, value);
    }
  }
  for (const [key, value] of Object.entries(overrides)) {
    params.set(key, value);
  }
  return `/search?${params.toString()}`;
}

export function SearchToolbar({
  filters,
  raw,
  total,
}: {
  filters: ParsedFilters;
  raw: RawSearchParams;
  total: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{total.toLocaleString()}</span>{" "}
        {total === 1 ? "listing" : "listings"} found
      </p>

      <div className="flex items-center gap-3">
        <div className="flex overflow-hidden rounded-lg border">
          <Link
            href={buildQuery(raw, { view: "grid" })}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              filters.view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <LayoutGrid className="size-3.5" />
            Grid
          </Link>
          <Link
            href={buildQuery(raw, { view: "map" })}
            className={`flex items-center gap-1.5 border-l px-3 py-1.5 text-xs font-medium transition-colors ${
              filters.view === "map" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <MapIcon className="size-3.5" />
            Map
          </Link>
        </div>

        <form method="GET" action="/search" className="contents">
          {Object.entries(raw)
            .filter(([key]) => key !== "sort" && key !== "page")
            .flatMap(([key, value]) =>
              (Array.isArray(value) ? value : [value]).map(
                (v, i) => v !== undefined && <input key={`${key}-${i}`} type="hidden" name={key} value={v} />
              )
            )}
          <select
            name="sort"
            defaultValue={filters.sort}
            onChange={(e) => e.currentTarget.form?.requestSubmit()}
            className="h-9 rounded-lg border border-input bg-background px-2 text-xs font-medium text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </form>
      </div>
    </div>
  );
}

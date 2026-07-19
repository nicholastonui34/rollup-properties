import { AMENITIES, PROPERTY_TYPE_LABELS } from "@/lib/listing-options";
import type { ParsedFilters } from "@/lib/search";
import { prisma } from "@/lib/prisma";
import { AreaFilterFields } from "@/components/search/area-filter-fields";

const BEDROOM_OPTIONS = [
  { value: "0", label: "Bedsitter / studio" },
  { value: "1", label: "1 bedroom" },
  { value: "2", label: "2 bedrooms" },
  { value: "3", label: "3 bedrooms" },
  { value: "4", label: "4 bedrooms" },
  { value: "5", label: "5+ bedrooms" },
];

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
const inputClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";

export async function SearchFilters({ filters }: { filters: ParsedFilters }) {
  const areas = await prisma.area.findMany({
    orderBy: [{ town: "asc" }, { name: "asc" }],
    select: { slug: true, name: true, town: true },
  });

  return (
    <form method="GET" action="/search" className="space-y-5 rounded-xl border bg-card p-4">
      {/* Preserve view + sort across filter changes */}
      <input type="hidden" name="view" value={filters.view} />

      <div>
        <label className={labelClass} htmlFor="f-purpose">
          Looking to
        </label>
        <select id="f-purpose" name="purpose" defaultValue={filters.purpose ?? ""} className={selectClass}>
          <option value="">Rent or buy</option>
          <option value="RENT">Rent</option>
          <option value="SALE">Buy</option>
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="f-q">
          Area, estate or keyword
        </label>
        <input
          id="f-q"
          type="text"
          name="q"
          defaultValue={filters.q ?? ""}
          placeholder="e.g. Kilimani"
          className={inputClass}
        />
      </div>

      <AreaFilterFields
        areas={areas}
        initialTown={filters.town ?? ""}
        initialAreaSlug={filters.areaSlug ?? ""}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="f-min">
            Min price (KES)
          </label>
          <input
            id="f-min"
            type="number"
            name="minPrice"
            min={0}
            defaultValue={filters.minPrice ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="f-max">
            Max price (KES)
          </label>
          <input
            id="f-max"
            type="number"
            name="maxPrice"
            min={0}
            defaultValue={filters.maxPrice ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="f-bedrooms">
          Bedrooms
        </label>
        <select
          id="f-bedrooms"
          name="bedrooms"
          defaultValue={filters.bedrooms !== undefined ? String(filters.bedrooms) : ""}
          className={selectClass}
        >
          <option value="">Any</option>
          {BEDROOM_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="f-type">
          Property type
        </label>
        <select
          id="f-type"
          name="propertyType"
          defaultValue={filters.propertyType ?? ""}
          className={selectClass}
        >
          <option value="">Any type</option>
          {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="furnished" value="1" defaultChecked={filters.furnished} className="size-4 rounded border-input" />
        Furnished only
      </label>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="includeTaken"
          value="1"
          defaultChecked={filters.includeTaken}
          className="size-4 rounded border-input"
        />
        Include rented/sold listings
      </label>

      <fieldset>
        <legend className={labelClass}>Amenities</legend>
        <div className="grid grid-cols-1 gap-1.5">
          {AMENITIES.map((amenity) => (
            <label key={amenity} className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                name="amenities"
                value={amenity}
                defaultChecked={filters.amenities.includes(amenity)}
                className="size-4 rounded border-input"
              />
              {amenity}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex gap-2">
        <button
          type="submit"
          className="h-10 flex-1 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Apply filters
        </button>
        <a
          href={`/search?purpose=${filters.purpose ?? ""}&view=${filters.view}`}
          className="flex h-10 items-center justify-center rounded-lg border border-input px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
        >
          Reset
        </a>
      </div>
    </form>
  );
}

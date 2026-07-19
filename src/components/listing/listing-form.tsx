"use client";

import { useActionState, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { AMENITIES, PROPERTY_TYPE_LABELS } from "@/lib/listing-options";
import type { ListingFormState } from "@/app/dashboard/listings/actions";

const MapPicker = dynamic(() => import("./map-picker").then((m) => m.MapPicker), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

type Area = { id: string; name: string; town: string };
type PropertyType = keyof typeof PROPERTY_TYPE_LABELS;

type ExistingListing = {
  title: string;
  description: string;
  purpose: "RENT" | "SALE";
  propertyType: PropertyType;
  priceKes: number;
  depositKes: number | null;
  serviceChargeKes: number | null;
  sizeSqm: number | null;
  tourEmbedUrl: string | null;
  videoUrl: string | null;
  managerWebsiteUrl: string | null;
  managerAgencyName: string | null;
  areaId: string | null;
  estate: string | null;
  streetAddress: string;
  lat: number | null;
  lng: number | null;
  bedrooms: number;
  bathrooms: number;
  furnished: boolean;
  amenities: string[];
};

export function ListingForm({
  action,
  areas,
  listing,
  submitLabel,
}: {
  action: (state: ListingFormState, formData: FormData) => Promise<ListingFormState>;
  areas: Area[];
  listing?: ExistingListing;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ListingFormState, FormData>(
    action,
    undefined
  );
  const [purpose, setPurpose] = useState(listing?.purpose ?? "RENT");
  const [propertyType, setPropertyType] = useState<PropertyType>(listing?.propertyType ?? "APARTMENT");
  const [areaId, setAreaId] = useState(listing?.areaId ?? "");
  const [amenities, setAmenities] = useState<string[]>(listing?.amenities ?? []);
  const [lat, setLat] = useState<number | null>(listing?.lat ?? null);
  const [lng, setLng] = useState<number | null>(listing?.lng ?? null);

  const areaOptions: ComboboxOption[] = areas.map((a) => ({
    value: a.id,
    label: a.name,
    group: a.town,
  }));

  function toggleAmenity(a: string) {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="purpose" value={purpose} />
      <input type="hidden" name="propertyType" value={propertyType} />
      <input type="hidden" name="areaId" value={areaId} />
      {lat != null && <input type="hidden" name="lat" value={lat} />}
      {lng != null && <input type="hidden" name="lng" value={lng} />}
      {amenities.map((a) => (
        <input key={a} type="hidden" name="amenities" value={a} />
      ))}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Basics</h2>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            placeholder="Bright 2BR apartment in Kilimani"
            defaultValue={listing?.title}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Purpose</Label>
            <Select value={purpose} onValueChange={(v) => setPurpose(v as "RENT" | "SALE")}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="RENT">For rent</SelectItem>
                <SelectItem value="SALE">For sale</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Property type</Label>
            <Select value={propertyType} onValueChange={(v) => setPropertyType(v as PropertyType)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={5}
            placeholder="Describe the unit honestly — condition, natural light, neighbourhood, nearby landmarks…"
            defaultValue={listing?.description}
            required
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Location</h2>
        <div className="space-y-2">
          <Label>Area</Label>
          <Combobox
            options={areaOptions}
            value={areaId}
            onValueChange={setAreaId}
            placeholder="Select an area"
            searchPlaceholder="Search areas…"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="estate">Estate / building (optional)</Label>
            <Input id="estate" name="estate" placeholder="e.g. Yaya Towers" defaultValue={listing?.estate ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="streetAddress">Street address / landmark</Label>
            <Input
              id="streetAddress"
              name="streetAddress"
              placeholder="e.g. Argwings Kodhek Rd, near Yaya Centre"
              defaultValue={listing?.streetAddress}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Map pin (optional)</Label>
          <p className="text-xs text-muted-foreground">
            Click the map to drop a pin at the property. Add one to appear in map search and
            Student Housing results.
          </p>
          <div className="h-64 w-full overflow-hidden rounded-xl border border-border">
            <MapPicker lat={lat} lng={lng} onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); }} />
          </div>
          {lat != null && lng != null && (
            <p className="text-xs text-muted-foreground">
              Pin set at {lat.toFixed(5)}, {lng.toFixed(5)}.{" "}
              <button type="button" className="underline underline-offset-2" onClick={() => { setLat(null); setLng(null); }}>
                Clear
              </button>
            </p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Pricing & size</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="priceKes">
              {purpose === "RENT" ? "Rent (KES/month)" : "Price (KES)"}
            </Label>
            <Input id="priceKes" name="priceKes" type="number" min={0} defaultValue={listing?.priceKes} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="depositKes">Deposit (KES, optional)</Label>
            <Input id="depositKes" name="depositKes" type="number" min={0} defaultValue={listing?.depositKes ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="serviceChargeKes">Service charge (KES, optional)</Label>
            <Input id="serviceChargeKes" name="serviceChargeKes" type="number" min={0} defaultValue={listing?.serviceChargeKes ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sizeSqm">Size (sqm, optional)</Label>
            <Input id="sizeSqm" name="sizeSqm" type="number" min={0} defaultValue={listing?.sizeSqm ?? ""} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input id="bedrooms" name="bedrooms" type="number" min={0} max={20} defaultValue={listing?.bedrooms ?? 0} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input id="bathrooms" name="bathrooms" type="number" min={0} max={20} defaultValue={listing?.bathrooms ?? 0} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="furnished" className="pt-6">
              <input
                id="furnished"
                name="furnished"
                type="checkbox"
                defaultChecked={listing?.furnished}
                className="size-4 rounded border-input"
              />
              Furnished
            </Label>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Tour & video (optional)</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            A 3D walkthrough or video tour leads the listing page, above the photos — the single
            biggest thing that builds trust with a remote or first-time viewer.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tourEmbedUrl">3D tour link</Label>
            <Input
              id="tourEmbedUrl"
              name="tourEmbedUrl"
              type="url"
              placeholder="https://my.matterport.com/show/?m=…"
              defaultValue={listing?.tourEmbedUrl ?? ""}
            />
            <p className="text-xs text-muted-foreground">Matterport, Kuula, Momento360 or CloudPano.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video tour link</Label>
            <Input
              id="videoUrl"
              name="videoUrl"
              type="url"
              placeholder="https://youtube.com/watch?v=… or https://vimeo.com/…"
              defaultValue={listing?.videoUrl ?? ""}
            />
            <p className="text-xs text-muted-foreground">YouTube or Vimeo link.</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Agency website (optional)</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Shown after a seeker unlocks your contact, alongside your phone number — a bonus
            channel, not a replacement for direct contact.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="managerAgencyName">Agency name</Label>
            <Input
              id="managerAgencyName"
              name="managerAgencyName"
              placeholder="e.g. Cedar Park Property Managers"
              defaultValue={listing?.managerAgencyName ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="managerWebsiteUrl">Website URL</Label>
            <Input
              id="managerWebsiteUrl"
              name="managerWebsiteUrl"
              type="url"
              placeholder="https://example.com"
              defaultValue={listing?.managerWebsiteUrl ?? ""}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Amenities</h2>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {AMENITIES.map((a) => (
            <label
              key={a}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm has-checked:border-primary has-checked:bg-primary/5"
            >
              <input
                type="checkbox"
                checked={amenities.includes(a)}
                onChange={() => toggleAmenity(a)}
                className="size-4 rounded border-input"
              />
              {a}
            </label>
          ))}
        </div>
      </section>

      {state?.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

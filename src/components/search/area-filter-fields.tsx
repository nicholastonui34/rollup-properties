"use client";

import { useState } from "react";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";

type Area = { slug: string; name: string; town: string };

export function AreaFilterFields({
  areas,
  initialTown,
  initialAreaSlug,
}: {
  areas: Area[];
  initialTown: string;
  initialAreaSlug: string;
}) {
  const [town, setTown] = useState(initialTown);
  const [areaSlug, setAreaSlug] = useState(initialAreaSlug);

  const towns = [...new Set(areas.map((a) => a.town))];
  const townOptions: ComboboxOption[] = [
    { value: "", label: "Any town" },
    ...towns.map((t) => ({ value: t, label: t })),
  ];
  const areaOptions: ComboboxOption[] = [
    { value: "", label: "Any area" },
    ...areas.map((a) => ({ value: a.slug, label: a.name, group: a.town })),
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground" htmlFor="f-town-search">
          Town
        </label>
        <input type="hidden" name="town" value={town} />
        <Combobox
          options={townOptions}
          value={town}
          onValueChange={setTown}
          placeholder="Any town"
          searchPlaceholder="Search towns…"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground" htmlFor="f-area-search">
          Area
        </label>
        <input type="hidden" name="area" value={areaSlug} />
        <Combobox
          options={areaOptions}
          value={areaSlug}
          onValueChange={setAreaSlug}
          placeholder="Any area"
          searchPlaceholder="Search areas…"
        />
      </div>
    </div>
  );
}

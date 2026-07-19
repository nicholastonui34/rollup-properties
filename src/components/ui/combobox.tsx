"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ComboboxOption = {
  value: string;
  label: string;
  group?: string;
};

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select…",
  searchPlaceholder = "Type to search…",
  emptyText = "No matches",
  className,
}: {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.group?.toLowerCase().includes(q)
    );
  }, [options, query]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, ComboboxOption[]>();
    for (const opt of filtered) {
      const key = opt.group ?? "";
      const bucket = map.get(key) ?? [];
      bucket.push(opt);
      map.set(key, bucket);
    }
    return map;
  }, [filtered]);

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setQuery("");
          requestAnimationFrame(() => inputRef.current?.focus());
        }
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className="z-50 w-(--radix-popover-trigger-width) overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10"
        >
          <div className="relative border-b p-2">
            <SearchIcon className="pointer-events-none absolute left-4.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 w-full rounded-md border border-input bg-background pl-7 pr-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && filtered.length >= 1) {
                  onValueChange(filtered[0].value);
                  setOpen(false);
                } else if (e.key === "Escape") {
                  setOpen(false);
                }
              }}
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <p className="px-2 py-3 text-center text-sm text-muted-foreground">{emptyText}</p>
            )}
            {[...grouped.entries()].map(([group, items]) => (
              <div key={group || "_"} className="py-1">
                {group && <p className="px-2 py-1 text-xs text-muted-foreground">{group}</p>}
                {items.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onValueChange(opt.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                      opt.value === value && "bg-accent/50"
                    )}
                  >
                    <CheckIcon
                      className={cn("size-4 shrink-0", opt.value === value ? "opacity-100" : "opacity-0")}
                    />
                    {opt.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

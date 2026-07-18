import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Bell, BellOff } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/listing/confirm-submit-button";
import { deleteSavedSearchAction, toggleAlertsAction } from "./actions";

export const metadata: Metadata = { title: "Saved searches" };

function filtersToQueryString(filtersJson: unknown): string {
  const params = new URLSearchParams();
  if (filtersJson && typeof filtersJson === "object") {
    for (const [key, value] of Object.entries(filtersJson as Record<string, unknown>)) {
      if (Array.isArray(value)) value.forEach((v) => params.append(key, String(v)));
      else if (value !== undefined && value !== null) params.set(key, String(value));
    }
  }
  return params.toString();
}

export default async function SavedSearchesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { saved } = await searchParams;

  const savedSearches = await prisma.savedSearch.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Saved searches
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        We&apos;ll email you when new verified listings match a search with alerts on.
      </p>
      {saved === "1" && (
        <div className="mt-4 rounded-lg bg-primary/10 px-4 py-2 text-sm text-primary">
          Search saved — alerts are on.
        </div>
      )}

      {savedSearches.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            You haven&apos;t saved any searches yet. Save one from the search page.
          </p>
          <Link href="/search" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Browse verified listings
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {savedSearches.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div>
                <Link href={`/search?${filtersToQueryString(s.filtersJson)}`} className="font-medium text-foreground hover:underline">
                  {s.name}
                </Link>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {s.alertsEnabled ? "Alerts on" : "Alerts off"} · Saved{" "}
                  {s.createdAt.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <div className="flex gap-2">
                <form action={toggleAlertsAction.bind(null, s.id)}>
                  <Button type="submit" size="sm" variant="outline">
                    {s.alertsEnabled ? <BellOff className="size-3.5" /> : <Bell className="size-3.5" />}
                    {s.alertsEnabled ? "Turn off alerts" : "Turn on alerts"}
                  </Button>
                </form>
                <form action={deleteSavedSearchAction.bind(null, s.id)}>
                  <ConfirmSubmitButton
                    type="submit"
                    size="sm"
                    variant="destructive"
                    confirmMessage="Delete this saved search?"
                  >
                    Delete
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

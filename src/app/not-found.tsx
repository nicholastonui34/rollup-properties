import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/site/logo";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <LogoMark className="size-14" />
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 text-muted-foreground">
        This listing may have been taken down, or the page never existed. Let&apos;s get you back
        to verified homes.
      </p>

      <form action="/search" method="GET" className="mt-8 flex w-full max-w-md gap-2">
        <input
          type="text"
          name="q"
          placeholder="Search area or estate — e.g. Kilimani…"
          aria-label="Search area or estate"
          className="h-12 flex-1 rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button type="submit" size="lg" className="h-12 rounded-xl px-6 text-sm">
          Search
        </Button>
      </form>

      <Button asChild variant="outline" className="mt-4">
        <Link href="/">Back to homepage</Link>
      </Button>
    </div>
  );
}

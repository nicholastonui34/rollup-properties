import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { prisma } from "@/lib/prisma";

const MAX_EXPLORE_LINKS = 4;

// Only link to (town, purpose) pairs with real LIVE inventory — a footer
// link into an empty results page is exactly the trust bug this fixes
// (Mombasa/Kisumu links used to be hardcoded here with zero listings behind
// them). Recomputed on every render so new towns show up automatically as
// they get real coverage.
async function getExploreLinks() {
  const rows = await prisma.listing.groupBy({
    by: ["town", "purpose"],
    where: { status: "LIVE" },
    _count: { town: true },
    orderBy: { _count: { town: "desc" } },
    take: MAX_EXPLORE_LINKS,
  });

  return rows.map((r) => ({
    href: `/search?purpose=${r.purpose}&town=${encodeURIComponent(r.town)}`,
    label: r.purpose === "RENT" ? `Rentals in ${r.town}` : `Homes for sale in ${r.town}`,
  }));
}

export async function SiteFooter() {
  const exploreLinks = await getExploreLinks();
  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Verified homes across Kenya. Real photos, real addresses, honest
            prices — and direct contact with property managers. No brokers.
          </p>
        </div>

        <div className={exploreLinks.length === 0 ? "hidden" : ""}>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Explore</h3>
          <ul className="space-y-2 text-sm">
            {exploreLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Get started</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/signup"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Create a free account
              </Link>
            </li>
            <li>
              <Link
                href="/signup?role=LISTER"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                List your property
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Log in
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:px-6">
          <p>© {new Date().getFullYear()} Rollup Properties · Nairobi, Kenya</p>
          <nav className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Legal">
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href="/refund-policy" className="transition-colors hover:text-foreground">
              Refund Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

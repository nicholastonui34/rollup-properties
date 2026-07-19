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

const FOOTER_COLUMNS = [
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/careers", label: "Careers" },
      { href: "/news", label: "News" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/help", label: "Help" },
      { href: "/help#contact", label: "Contact" },
    ],
  },
  {
    title: "Partners",
    links: [
      { href: "/advertise", label: "Advertise" },
      { href: "/signup?role=LISTER", label: "List with Us / Pro Media" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/applicant-privacy-notice", label: "Applicant Privacy Notice" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

export async function SiteFooter() {
  const exploreLinks = await getExploreLinks();
  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:grid-cols-2 md:grid-cols-6">
        <div className="space-y-3 sm:col-span-2 md:col-span-1">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Verified homes across Kenya. Real photos, real addresses, honest
            prices — and direct contact with property managers. No brokers.
          </p>
        </div>

        {exploreLinks.length > 0 && (
          <div>
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
        )}

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="mb-3 text-sm font-semibold text-foreground">{column.title}</h3>
            <ul className="space-y-2 text-sm">
              {column.links.map((l) => (
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
        ))}
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

import Link from "next/link";
import { Logo } from "@/components/site/logo";

const exploreLinks = [
  { href: "/search?purpose=RENT&town=Nairobi", label: "Rentals in Nairobi" },
  { href: "/search?purpose=SALE&town=Nairobi", label: "Homes for sale in Nairobi" },
  { href: "/search?purpose=RENT&town=Mombasa", label: "Rentals in Mombasa" },
  { href: "/search?purpose=RENT&town=Kisumu", label: "Rentals in Kisumu" },
];

export function SiteFooter() {
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
        <p className="mx-auto max-w-6xl px-4 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} Rollup Properties · Nairobi, Kenya
        </p>
      </div>
    </footer>
  );
}

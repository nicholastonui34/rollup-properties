import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UNIVERSITIES } from "@/lib/universities";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const POPULAR_AREAS = [
  "Kilimani",
  "Westlands",
  "Kasarani",
  "Roysambu",
  "South B",
  "Langata",
  "Ruaka",
  "Syokimau",
  "Utawala",
  "Kileleshwa",
].map((name) => ({ name, slug: slugify(`nairobi-${name}`) }));

const STEPS = [
  {
    title: "Search verified listings",
    body: "Every home on Rollup is checked before it goes live — real unit, real photos, real address. The verified badge shows when it was last confirmed.",
  },
  {
    title: "Unlock the direct contact",
    body: "Pay a small one-time fee via M-Pesa to reveal the property manager's phone number. Far cheaper than a broker's viewing fee — and it's yours forever.",
  },
  {
    title: "Deal directly. No middlemen.",
    body: "Call or WhatsApp the manager, view the house, and negotiate directly. If a listing turns out fake, we refund you and ban the lister.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <Badge className="mb-5 bg-gold text-gold-foreground hover:bg-gold">
            Launching in Nairobi
          </Badge>
          <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Find a verified home.
            <br />
            Skip the broker.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
            Real photos. Real addresses. Honest prices. Search verified rentals
            and homes for sale across Kenya, then talk directly to the property
            manager.
          </p>

          {/* Search bar */}
          <form
            action="/search"
            method="GET"
            className="mt-9 flex max-w-2xl flex-col gap-2 rounded-2xl bg-background p-2 shadow-lg sm:flex-row"
          >
            <select
              name="purpose"
              defaultValue="RENT"
              aria-label="Rent or buy"
              className="h-12 rounded-xl border border-input bg-background px-3 text-sm font-medium text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-32"
            >
              <option value="RENT">Rent</option>
              <option value="SALE">Buy</option>
            </select>
            <input
              type="text"
              name="q"
              placeholder="Search area or estate — e.g. Kilimani, Ruaka, Syokimau…"
              aria-label="Search area or estate"
              className="h-12 flex-1 rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <Button type="submit" size="lg" className="h-12 rounded-xl px-6 text-sm">
              Search
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-primary-foreground/60">
              Popular:
            </span>
            {POPULAR_AREAS.slice(0, 6).map((area) => (
              <Link
                key={area.slug}
                href={`/rent/${area.slug}`}
                className="rounded-full border border-primary-foreground/25 px-3 py-1 text-xs text-primary-foreground/85 transition-colors hover:border-gold hover:text-gold"
              >
                {area.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6">
          {[
            ["Verified before it goes live", "Photos, address and ownership checked on every single listing."],
            ["Direct manager contacts", "One small M-Pesa payment. No broker fees, no viewing scams."],
            ["Fake listing? Full refund.", "Proven fake after unlock — you get your money back, they get banned."],
          ].map(([title, body]) => (
            <div key={title} className="flex gap-3">
              <span
                className="mt-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                aria-hidden="true"
              >
                <svg viewBox="0 0 12 12" className="size-3" fill="none">
                  <path d="M2.5 6.2 5 8.7l4.5-5.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Student Housing Hub */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <Badge variant="secondary">Student Housing Hub</Badge>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Verified housing near your campus
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Hostels, shared apartments and independent units within 10km of Nairobi&apos;s main
              universities — same verification, same refund guarantee, just filtered to what
              actually matters for students.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {UNIVERSITIES.map((u) => (
                <Button key={u.slug} asChild variant="outline" size="sm">
                  <Link href={`/search?purpose=RENT&university=${u.slug}`}>{u.name}</Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            How Rollup works
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Built for house-hunters tired of fake photos, vague locations and
            broker fees for houses that don&apos;t exist.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <span className="font-display text-4xl font-semibold text-gold">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular areas */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Popular areas in Nairobi
          </h2>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {POPULAR_AREAS.map((area) => (
              <Link
                key={area.slug}
                href={`/rent/${area.slug}`}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {area.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Lister CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Own or manage property?
            </h2>
            <p className="mt-2 max-w-lg text-primary-foreground/80">
              List free, get verified, and receive direct leads from serious
              tenants and buyers — we never stand between you and your client.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="h-12 shrink-0 rounded-xl bg-gold px-6 text-gold-foreground hover:bg-gold/90"
          >
            <Link href="/signup?role=LISTER">List your property</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

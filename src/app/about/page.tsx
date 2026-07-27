import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Users, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description: "Why Nyoomba exists and how we verify every listing before it goes live.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        About Nyoomba
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Finding a home in Kenya shouldn&apos;t mean chasing fake photos, vague locations, or
        paying a broker for a house that turns out not to exist. Nyoomba exists to fix
        that — a housing marketplace where every listing is checked by a real person before it
        ever reaches you, and where you deal directly with the property manager, no middleman in
        between.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <ShieldCheck className="size-6 text-primary" aria-hidden="true" />
          <h2 className="mt-3 text-sm font-semibold text-foreground">Verified before it goes live</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Every listing&apos;s photos, address and ownership are checked by a Nyoomba verifier
            before it&apos;s shown publicly.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <Handshake className="size-6 text-primary" aria-hidden="true" />
          <h2 className="mt-3 text-sm font-semibold text-foreground">Direct, not brokered</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Unlock a manager&apos;s direct contact for a small one-time fee — no broker
            commission, no repeat viewing fees.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <Users className="size-6 text-primary" aria-hidden="true" />
          <h2 className="mt-3 text-sm font-semibold text-foreground">Accountable to both sides</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            A confirmed-fake listing gets a full refund for the seeker and a ban for the lister —
            trust has to run both ways.
          </p>
        </div>
      </div>

      <h2 className="mt-12 text-sm font-semibold text-foreground">How verification builds trust</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Before a listing goes live, a Nyoomba verifier confirms it matches reality — the unit, the
        address, and the lister&apos;s right to manage it. The verified badge on a listing shows
        the date of that check, and listings are periodically re-confirmed so the badge stays
        meaningful, not a one-time stamp on a stale listing.
      </p>

      <h2 className="mt-8 text-sm font-semibold text-foreground">Where we&apos;re starting</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        We&apos;re launching in Nairobi first — rentals, then sales, then other Kenyan towns as
        our verification network grows. Every decision we make is weighed against one question:
        does this make Nyoomba more trustworthy for the next person searching for a home?
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/search">Search verified listings</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/signup?role=LISTER">List your property</Link>
        </Button>
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        Questions? Reach us at{" "}
        <a href="mailto:support@nyoomba.co.ke" className="text-primary hover:underline">
          support@nyoomba.co.ke
        </a>
        .
      </p>
    </div>
  );
}

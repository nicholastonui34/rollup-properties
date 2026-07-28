import Link from "next/link";
import type { Metadata } from "next";
import { Globe, FileText, CalendarCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgencyWebsiteInquiryForm } from "@/components/agency-websites/inquiry-form";

export const metadata: Metadata = {
  title: "Websites for real estate agencies",
  description:
    "A branded website for your agency or property portfolio, with tenant applications, tour booking and verified listings handled by Nyoomba.",
};

const FEATURES = [
  {
    icon: Globe,
    title: "Your own branded page",
    body: "A dedicated page for your agency at nyoomba.com/pm/your-name, created automatically the moment you list — ask us about a custom domain.",
  },
  {
    icon: FileText,
    title: "Tenants apply online",
    body: "Prospective tenants submit a full rental application — ID, income, references, documents — straight from your page.",
  },
  {
    icon: CalendarCheck,
    title: "Tours book themselves",
    body: "Publish your availability and let tenants book an in-person or video viewing without a single back-and-forth call.",
  },
  {
    icon: ShieldCheck,
    title: "Backed by the verified badge",
    body: "Every listing you add still goes through the same verification and refund guarantee that earns renter trust.",
  },
];

export default function AgencyWebsitesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Websites for real estate agencies
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Get a branded home for your listings, with tenant applications, tour booking and payments
        handled on Nyoomba&apos;s platform — no separate site to build or maintain.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl border border-border bg-card p-5">
            <f.icon className="size-6 text-primary" aria-hidden="true" />
            <h2 className="mt-3 text-sm font-semibold text-foreground">{f.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Get your microsite free</h2>
          <p className="mt-1 text-sm text-primary-foreground/80">
            Sign up as a lister and it&apos;s ready as soon as you publish your first listing.
          </p>
        </div>
        <Button asChild size="lg" className="shrink-0 bg-gold text-gold-foreground hover:bg-gold/90">
          <Link href="/signup?role=LISTER">Get started</Link>
        </Button>
      </div>

      <div className="mt-10">
        <h2 className="mb-1 text-sm font-semibold text-foreground">Need a custom domain or branding?</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Tell us about your agency and we&apos;ll follow up with options.
        </p>
        <AgencyWebsiteInquiryForm />
      </div>
    </div>
  );
}

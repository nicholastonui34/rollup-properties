import type { Metadata } from "next";
import { TrendingUp, GraduationCap, Building2, ShieldCheck } from "lucide-react";
import { InvestorInquiryForm } from "@/components/investors/inquiry-form";

export const metadata: Metadata = {
  title: "Investors",
  description: "Nyoomba is raising KES 50,000,000 to scale Kenya's verified housing marketplace.",
};

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: "Trust as the moat",
    body: "Every listing is verified before it goes live, backed by a real refund guarantee — the thing brokers and classifieds can't offer.",
  },
  {
    icon: GraduationCap,
    title: "Students as the wedge",
    body: "Intake season creates predictable, recurring demand near campus — a natural path to becoming Kenya's onboarding partner for incoming and international students.",
  },
  {
    icon: Building2,
    title: "A second revenue line",
    body: "We're now building branded websites for agencies and property managers, with tenant apply/book/pay handled on our rails.",
  },
  {
    icon: TrendingUp,
    title: "Monetization already live",
    body: "Contact-unlock fees, listing fees, Pro Media, and advertising are shipped and generating revenue today.",
  },
];

export default function InvestorsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Invest in Nyoomba
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        We&apos;re building the verified way to rent, buy, sell and manage property in Kenya —
        no broker fees, no fake listings, direct contact every time.
      </p>

      <div className="mt-8 rounded-2xl border border-primary/20 bg-primary text-primary-foreground p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-wide text-primary-foreground/70">
          Current raise
        </p>
        <p className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
          KES 50,000,000
        </p>
        <p className="mt-1 text-sm text-primary-foreground/80">
          Seed round to scale verification, the Student Housing Hub, and our agency-website
          product across Kenya.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {HIGHLIGHTS.map((h) => (
          <div key={h.title} className="rounded-2xl border border-border bg-card p-5">
            <h.icon className="size-6 text-primary" aria-hidden="true" />
            <h2 className="mt-3 text-sm font-semibold text-foreground">{h.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{h.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="mb-1 text-sm font-semibold text-foreground">Interested in investing?</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Share a bit about yourself and we&apos;ll follow up with the deck and financials.
        </p>
        <InvestorInquiryForm />
      </div>
    </div>
  );
}

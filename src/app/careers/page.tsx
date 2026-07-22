import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CAREER_ROLES } from "@/lib/careers";
import { ApplicationForm } from "@/components/careers/application-form";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join Nyoomba — help build a verified, broker-free housing market in Kenya.",
};

export default function CareersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Careers at Nyoomba
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        We&apos;re building a housing market Kenyans can trust — verified listings, direct contact
        with property managers, and no broker fees. That takes people on the ground verifying
        real properties, sales teams onboarding listers, and a support team that actually cares.
        If that sounds like you, we&apos;d like to hear from you.
      </p>

      <div className="mt-10 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          {CAREER_ROLES.length > 0 ? "Open roles" : "No openings right now"}
        </h2>

        {CAREER_ROLES.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            We don&apos;t have anything open at the moment, but we&apos;re always keen to hear from
            good people — join our talent pool below.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border">
            {CAREER_ROLES.map((role) => (
              <li key={role.slug}>
                <Link
                  href={`/careers/${role.slug}`}
                  className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-secondary/50"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{role.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {role.department} · {role.location} · {role.type}
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-10">
        <h2 className="mb-1 text-sm font-semibold text-foreground">
          {CAREER_ROLES.length > 0 ? "Don't see the right role?" : "Join our talent pool"}
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Send us a general application and we&apos;ll reach out when something fits.
        </p>
        <ApplicationForm roleSlug={null} />
      </div>
    </div>
  );
}

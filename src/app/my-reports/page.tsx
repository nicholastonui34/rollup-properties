import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { REPORT_STATUS_BADGE_VARIANT, REPORT_STATUS_LABELS } from "@/lib/listing-options";

export const metadata: Metadata = { title: "My reports" };

export default async function MyReportsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const reports = await prisma.report.findMany({
    where: { reporterId: session.user.id },
    include: { listing: { select: { slug: true, title: true, town: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        My reports
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Listings you&apos;ve flagged, and where each one stands under the refund guarantee.
      </p>

      {reports.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">You haven&apos;t reported any listings.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {reports.map((r) => (
            <Link
              key={r.id}
              href={`/my-reports/${r.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <div>
                <p className="font-medium text-foreground">{r.listing.title}</p>
                <p className="text-sm text-muted-foreground">
                  {r.listing.town} · Reported{" "}
                  {r.createdAt.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <Badge variant={REPORT_STATUS_BADGE_VARIANT[r.status]}>{REPORT_STATUS_LABELS[r.status]}</Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

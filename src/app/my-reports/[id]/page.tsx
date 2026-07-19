import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { REPORT_STATUS_BADGE_VARIANT, REPORT_STATUS_LABELS } from "@/lib/listing-options";

export const metadata: Metadata = { title: "Report status" };

const STATUS_COPY: Record<string, string> = {
  OPEN: "We've received your report and it's in the queue for review.",
  INVESTIGATING: "Our team is actively looking into this listing.",
  REFUNDED: "Confirmed fake — your payment (if any) has been refunded and the listing was pulled down.",
  REJECTED: "We looked into this and didn't find enough to confirm it's fake.",
};

export default async function MyReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      listing: { select: { slug: true, title: true, town: true } },
      unlock: { include: { payment: { select: { amountKes: true, status: true, refundedAt: true } } } },
    },
  });
  if (!report || report.reporterId !== session.user.id) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link href="/my-reports" className="text-sm text-muted-foreground hover:underline">
        &larr; All reports
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {report.listing.title}
        </h1>
        <Badge variant={REPORT_STATUS_BADGE_VARIANT[report.status]}>
          {REPORT_STATUS_LABELS[report.status]}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{report.listing.town}</p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 space-y-3">
        <p className="text-sm text-foreground">{STATUS_COPY[report.status]}</p>

        <div className="border-t border-border pt-3 text-sm">
          <p className="font-medium text-foreground">Your report</p>
          <p className="mt-1 text-muted-foreground">{report.reason}</p>
          {report.details && <p className="mt-1 text-muted-foreground">{report.details}</p>}
          <p className="mt-1 text-xs text-muted-foreground">
            Filed {report.createdAt.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>

        {report.unlock?.payment && (
          <div className="border-t border-border pt-3 text-sm">
            <p className="font-medium text-foreground">Payment</p>
            <p className="mt-1 text-muted-foreground">
              KES {report.unlock.payment.amountKes} —{" "}
              {report.unlock.payment.status === "REFUNDED" ? "Refunded" : "Not refunded"}
            </p>
          </div>
        )}

        {report.resolutionNote && (
          <div className="border-t border-border pt-3 text-sm">
            <p className="font-medium text-foreground">Resolution</p>
            <p className="mt-1 text-muted-foreground">{report.resolutionNote}</p>
            {report.resolvedAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                {report.resolvedAt.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
          </div>
        )}
      </div>

      <Link href={`/listings/${report.listing.slug}`} className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
        View listing
      </Link>
    </div>
  );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Circle } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  APPLICATION_STATUS_BADGE_VARIANT,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_STEPS,
} from "@/lib/listing-options";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Application status" };

export default async function ApplicationStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) notFound();

  const application = await prisma.rentalApplication.findUnique({
    where: { id },
    include: { pm: { select: { name: true } }, listing: { select: { title: true, slug: true } } },
  });
  if (!application) notFound();
  const isApplicant = application.applicantId === session.user.id;
  const isOwningPm = application.pmId === session.user.id;
  if (!isApplicant && !isOwningPm && session.user.role !== "ADMIN") notFound();

  const isDeclined = application.status === "DECLINED";
  const currentStepIndex = isDeclined
    ? APPLICATION_STATUS_STEPS.indexOf("UNDER_REVIEW")
    : APPLICATION_STATUS_STEPS.indexOf(application.status);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Application status</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          To {application.pm.name}
          {application.listing ? ` — ${application.listing.title}` : ""}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <Badge variant={APPLICATION_STATUS_BADGE_VARIANT[application.status]}>
          {APPLICATION_STATUS_LABELS[application.status]}
        </Badge>

        <div className="mt-6 space-y-4">
          {APPLICATION_STATUS_STEPS.map((step, i) => {
            const done = i <= currentStepIndex && !(isDeclined && i === currentStepIndex);
            const isCurrent = !isDeclined && i === currentStepIndex;
            return (
              <div key={step} className="flex items-center gap-3">
                {done || isCurrent ? (
                  <CheckCircle2 className={cn("size-5", done ? "text-primary" : "text-muted-foreground")} aria-hidden="true" />
                ) : (
                  <Circle className="size-5 text-muted-foreground" aria-hidden="true" />
                )}
                <span className={cn("text-sm", isCurrent ? "font-medium text-foreground" : "text-muted-foreground")}>
                  {APPLICATION_STATUS_LABELS[step]}
                </span>
              </div>
            );
          })}
          {isDeclined && (
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-destructive" aria-hidden="true" />
              <span className="text-sm font-medium text-foreground">Declined</span>
            </div>
          )}
        </div>

        {application.statusNote && (
          <p className="mt-4 rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
            {application.statusNote}
          </p>
        )}

        <p className="mt-4 text-xs text-muted-foreground">
          Submitted {application.createdAt.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}

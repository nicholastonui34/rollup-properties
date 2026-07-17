import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "My unlocks" };

export default async function UnlocksPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const unlocks = await prisma.unlock.findMany({
    where: { userId: session.user.id },
    include: {
      listing: { select: { slug: true, title: true, town: true, estate: true } },
      payment: { select: { amountKes: true, providerRef: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        My unlocks
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every contact you&apos;ve unlocked, with its payment receipt.
      </p>

      {unlocks.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">You haven&apos;t unlocked any contacts yet.</p>
          <Link href="/search" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Browse verified listings
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {unlocks.map((u) => (
            <div
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-4"
            >
              <div>
                <Link href={`/listings/${u.listing.slug}`} className="font-medium text-foreground hover:underline">
                  {u.listing.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {u.listing.estate ? `${u.listing.estate}, ` : ""}
                  {u.listing.town} · Unlocked{" "}
                  {u.createdAt.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                {u.payment && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Ref {u.payment.providerRef} · KES {u.payment.amountKes}
                  </p>
                )}
              </div>
              {u.payment && (
                <Badge variant={u.payment.status === "REFUNDED" ? "destructive" : "outline"}>
                  {u.payment.status === "REFUNDED" ? "Refunded" : "Paid"}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

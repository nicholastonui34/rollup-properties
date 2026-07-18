import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { displayPhone } from "@/lib/phone";

export const metadata: Metadata = { title: "Leads" };

export default async function ListingLeadsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const listing = await prisma.listing.findUnique({ where: { id }, select: { id: true, title: true, listerId: true } });
  if (!listing || (listing.listerId !== session.user.id && session.user.role !== "ADMIN")) notFound();

  const unlocks = await prisma.unlock.findMany({
    where: { listingId: id },
    include: { user: { select: { name: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
        ← Back to dashboard
      </Link>
      <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Leads for {listing.title}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Everyone who has unlocked your contact for this listing.
      </p>

      {unlocks.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">No one has unlocked your contact yet.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {unlocks.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-4">
              <div>
                <p className="font-medium text-foreground">{u.user.name}</p>
                <p className="text-sm text-muted-foreground">{displayPhone(u.user.phone)}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {u.createdAt.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

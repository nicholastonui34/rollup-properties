import type { Metadata } from "next";
import type { PaymentStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { RefundButton } from "@/components/admin/refund-button";
import { refundPaymentAction } from "./actions";

export const metadata: Metadata = { title: "Payments" };

const STATUS_VARIANT: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  SUCCESS: "default",
  FAILED: "destructive",
  REFUNDED: "secondary",
};

export default async function AdminPaymentsPage() {
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  const payments = await prisma.payment.findMany({
    include: {
      user: { select: { name: true, phone: true } },
      listing: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const totalCollected = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + p.amountKes, 0);
  const totalRefunded = payments
    .filter((p) => p.status === "REFUNDED")
    .reduce((sum, p) => sum + p.amountKes, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Payments
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          KES {totalCollected.toLocaleString()} collected · KES {totalRefunded.toLocaleString()} refunded
        </p>
      </div>

      {payments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">No payments yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">User</th>
                <th className="px-4 py-2 font-medium">Listing</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Ref</th>
                {isAdmin && <th className="px-4 py-2 font-medium">Refund</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {p.createdAt.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    {p.user.name}
                    <br />
                    <span className="text-xs text-muted-foreground">{p.user.phone}</span>
                  </td>
                  <td className="px-4 py-3">
                    {p.listing ? (
                      <a href={`/listings/${p.listing.slug}`} className="hover:underline">
                        {p.listing.title}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">KES {p.amountKes.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[p.status]}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.providerRef}</td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      {p.status === "SUCCESS" && (
                        <form action={refundPaymentAction.bind(null, p.id)}>
                          <RefundButton />
                        </form>
                      )}
                      {p.status === "REFUNDED" && p.refundReason && (
                        <span className="text-xs text-muted-foreground">{p.refundReason}</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

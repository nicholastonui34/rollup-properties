import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { KycVerifyButton } from "@/components/admin/kyc-verify-button";
import { BanListerButton } from "@/components/admin/ban-lister-button";
import { UnbanListerButton } from "@/components/admin/unban-lister-button";
import { banListerAction } from "./actions";
import { displayPhone } from "@/lib/phone";

export const metadata: Metadata = { title: "Lister KYC" };

export default async function AdminListersPage() {
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  const listers = await prisma.user.findMany({
    where: { role: "LISTER" },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      idNumber: true,
      idVerifiedAt: true,
      bannedAt: true,
      banReason: true,
      createdAt: true,
      _count: { select: { listings: true } },
    },
    orderBy: [{ idVerifiedAt: "asc" }, { createdAt: "desc" }],
  });

  const pending = listers.filter((l) => l.idNumber && !l.idVerifiedAt);
  const rest = listers.filter((l) => !(l.idNumber && !l.idVerifiedAt));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Lister KYC
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm listers control the properties they list before their first listing goes live.
        </p>
      </div>

      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground">Pending review ({pending.length})</h2>
          <div className="mt-3 space-y-2">
            {pending.map((lister) => (
              <div
                key={lister.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{lister.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {displayPhone(lister.phone)} · ID {lister.idNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">{lister._count.listings} listing(s)</p>
                </div>
                <div className="flex items-center gap-2">
                  <KycVerifyButton userId={lister.id} />
                  {isAdmin &&
                    (lister.bannedAt ? (
                      <UnbanListerButton userId={lister.id} />
                    ) : (
                      <form action={banListerAction.bind(null, lister.id)}>
                        <BanListerButton />
                      </form>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-foreground">All listers</h2>
        <div className="mt-3 space-y-2">
          {rest.map((lister) => (
            <div
              key={lister.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{lister.name}</p>
                <p className="text-sm text-muted-foreground">{displayPhone(lister.phone)}</p>
                <p className="text-xs text-muted-foreground">{lister._count.listings} listing(s)</p>
                {lister.bannedAt && (
                  <p className="text-xs text-destructive">Banned: {lister.banReason}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {lister.bannedAt ? (
                  <Badge variant="destructive">Banned</Badge>
                ) : lister.idVerifiedAt ? (
                  <Badge>ID verified</Badge>
                ) : (
                  <Badge variant="outline">No ID submitted</Badge>
                )}
                {isAdmin &&
                  (lister.bannedAt ? (
                    <UnbanListerButton userId={lister.id} />
                  ) : (
                    <form action={banListerAction.bind(null, lister.id)}>
                      <BanListerButton />
                    </form>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

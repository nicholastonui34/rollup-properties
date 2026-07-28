import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PmProfileForm } from "@/components/dashboard/pm-profile-form";
import { displayPhone } from "@/lib/phone";
import { getOrCreatePmSlug } from "@/lib/pm";

export const metadata: Metadata = { title: "Microsite profile" };

export default async function PmProfilePage() {
  const session = await auth();
  const [user, pmSlug] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: session!.user.id },
      select: { pmBio: true, whatsappPhone: true, whatsappEnabled: true, phone: true },
    }),
    getOrCreatePmSlug(session!.user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Microsite profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your public page is at{" "}
          <a href={`/pm/${pmSlug}`} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
            /pm/{pmSlug}
          </a>
          . Your account phone ({displayPhone(user.phone)}) is always shown to unlockers for calls.
        </p>
      </div>

      <PmProfileForm
        pmBio={user.pmBio ?? ""}
        whatsappPhone={user.whatsappPhone ?? ""}
        whatsappEnabled={user.whatsappEnabled}
      />
    </div>
  );
}

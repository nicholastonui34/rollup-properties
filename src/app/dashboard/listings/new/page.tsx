import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ListingForm } from "@/components/listing/listing-form";
import { createListingAction } from "@/app/dashboard/listings/actions";

export const metadata: Metadata = { title: "New listing" };

export default async function NewListingPage() {
  const areas = await prisma.area.findMany({
    orderBy: [{ town: "asc" }, { name: "asc" }],
    select: { id: true, name: true, town: true },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        New listing
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Save as a draft first — you&apos;ll add photos on the next screen, then submit for
        verification.
      </p>
      <div className="mt-8">
        <ListingForm action={createListingAction} areas={areas} submitLabel="Save & continue" />
      </div>
    </div>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function toggleFavoriteAction(listingId: string, path: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const existing = await prisma.savedListing.findUnique({
    where: { userId_listingId: { userId: session.user.id, listingId } },
  });

  if (existing) {
    await prisma.savedListing.delete({
      where: { userId_listingId: { userId: session.user.id, listingId } },
    });
  } else {
    await prisma.savedListing.create({ data: { userId: session.user.id, listingId } });
  }

  revalidatePath(path);
  revalidatePath("/favorites");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireOwner(savedSearchId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const savedSearch = await prisma.savedSearch.findUnique({ where: { id: savedSearchId } });
  if (!savedSearch || savedSearch.userId !== session.user.id) throw new Error("Not found");
  return savedSearch;
}

export async function deleteSavedSearchAction(savedSearchId: string) {
  await requireOwner(savedSearchId);
  await prisma.savedSearch.delete({ where: { id: savedSearchId } });
  revalidatePath("/saved-searches");
}

export async function toggleAlertsAction(savedSearchId: string) {
  const savedSearch = await requireOwner(savedSearchId);
  await prisma.savedSearch.update({
    where: { id: savedSearchId },
    data: { alertsEnabled: !savedSearch.alertsEnabled },
  });
  revalidatePath("/saved-searches");
}

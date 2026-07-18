"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function saveSearchAction(queryString: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Give this saved search a name");

  const filtersJson: Record<string, string | string[]> = {};
  for (const [key, value] of new URLSearchParams(queryString).entries()) {
    if (key === "page" || key === "view") continue;
    const existing = filtersJson[key];
    if (existing === undefined) filtersJson[key] = value;
    else filtersJson[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
  }

  await prisma.savedSearch.create({
    data: { userId: session.user.id, name, filtersJson, alertsEnabled: true },
  });

  redirect("/saved-searches?saved=1");
}

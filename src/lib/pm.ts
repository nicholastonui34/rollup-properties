import { prisma } from "@/lib/prisma";

export function slugifyPmName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "pm";
}

// Every LISTER gets a pmSlug at signup (see (auth)/actions.ts). This is a
// lazy-generate fallback for any account that predates that — e.g. the
// synthetic seed listers — so an Apply link never has nothing to point at.
export async function getOrCreatePmSlug(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { pmSlug: true, name: true },
  });
  if (user.pmSlug) return user.pmSlug;

  const base = slugifyPmName(user.name);
  const slug = `${base}-${userId.slice(-4)}`;
  await prisma.user.update({ where: { id: userId }, data: { pmSlug: slug } });
  return slug;
}

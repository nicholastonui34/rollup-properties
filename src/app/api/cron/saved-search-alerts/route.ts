import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { parseFilters, buildWhere, LISTING_CARD_SELECT, type RawSearchParams } from "@/lib/search";

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3600";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

// Digest job: for every saved search with alerts on, email the owner about
// LIVE listings that went live since the last check. Meant to run on a
// schedule (see vercel.json) but safe to hit manually while testing.
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = await getBaseUrl();
  const savedSearches = await prisma.savedSearch.findMany({
    where: { alertsEnabled: true },
    include: { user: { select: { email: true, name: true } } },
  });

  let emailsSent = 0;
  let checked = 0;

  for (const savedSearch of savedSearches) {
    if (!savedSearch.user.email) continue;
    checked += 1;

    const filters = parseFilters((savedSearch.filtersJson ?? {}) as RawSearchParams);
    const where = buildWhere(filters);
    const since = savedSearch.lastAlertedAt ?? savedSearch.createdAt;

    const matches = await prisma.listing.findMany({
      where: { ...where, createdAt: { gt: since } },
      select: LISTING_CARD_SELECT,
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    if (matches.length > 0) {
      const rows = matches
        .map(
          (m) =>
            `<li><a href="${baseUrl}/listings/${m.slug}">${m.title}</a> — KES ${m.priceKes.toLocaleString()}${m.purpose === "RENT" ? "/mo" : ""}, ${m.town}</li>`
        )
        .join("");
      const html = `<p>Hi ${savedSearch.user.name},</p><p>${matches.length} new listing${matches.length === 1 ? "" : "s"} match your saved search "${savedSearch.name}":</p><ul>${rows}</ul><p><a href="${baseUrl}/saved-searches">Manage your saved searches</a></p>`;

      const sent = await sendEmail(savedSearch.user.email, `New listings for "${savedSearch.name}"`, html);
      if (sent) emailsSent += 1;
    }

    await prisma.savedSearch.update({ where: { id: savedSearch.id }, data: { lastAlertedAt: new Date() } });
  }

  return NextResponse.json({ checked, emailsSent });
}

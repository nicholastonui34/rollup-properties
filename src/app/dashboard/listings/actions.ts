"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import { FREE_LISTING_QUOTA, MAX_LISTING_PHOTOS, MIN_LISTING_PHOTOS } from "@/lib/listing-options";
import { isAllowedTourUrl, toVideoEmbedUrl } from "@/lib/media-embed";
import { geocodeAddress } from "@/lib/geocoding";

export type ListingFormState = { error?: string } | undefined;

const listingSchema = z.object({
  title: z.string().trim().min(6, "Give the listing a clear title"),
  description: z.string().trim().min(30, "Description should be at least 30 characters"),
  purpose: z.enum(["RENT", "SALE"]),
  propertyType: z.enum([
    "BEDSITTER",
    "STUDIO",
    "APARTMENT",
    "MAISONETTE",
    "BUNGALOW",
    "TOWNHOUSE",
    "COMMERCIAL",
    "LAND",
    "HOSTEL",
    "SHARED_APARTMENT",
  ]),
  priceKes: z.coerce.number().int().positive("Enter a valid price"),
  depositKes: z.coerce.number().int().nonnegative().optional().or(z.nan().transform(() => undefined)),
  serviceChargeKes: z.coerce.number().int().nonnegative().optional().or(z.nan().transform(() => undefined)),
  sizeSqm: z.coerce.number().int().positive().optional().or(z.nan().transform(() => undefined)),
  tourEmbedUrl: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || isAllowedTourUrl(v), {
      message: "Tour link must be a Matterport, Kuula, Momento360 or CloudPano URL",
    }),
  videoUrl: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || toVideoEmbedUrl(v) !== null, {
      message: "Video link must be a YouTube or Vimeo URL",
    }),
  areaId: z.string().min(1, "Select an area"),
  estate: z.string().trim().optional(),
  streetAddress: z.string().trim().min(3, "Enter a street address or landmark"),
  lat: z.coerce.number().min(-90).max(90).optional().or(z.nan().transform(() => undefined)),
  lng: z.coerce.number().min(-180).max(180).optional().or(z.nan().transform(() => undefined)),
  bedrooms: z.coerce.number().int().min(0).max(20),
  bathrooms: z.coerce.number().int().min(0).max(20),
  furnished: z.coerce.boolean(),
  amenities: z.array(z.string()).default([]),
});

async function requireLister() {
  const session = await auth();
  if (!session?.user || !["LISTER", "ADMIN"].includes(session.user.role)) {
    throw new Error("Not authorized");
  }
  return session.user;
}

function parseListingForm(formData: FormData) {
  return listingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    purpose: formData.get("purpose"),
    propertyType: formData.get("propertyType"),
    priceKes: formData.get("priceKes"),
    depositKes: formData.get("depositKes") || undefined,
    serviceChargeKes: formData.get("serviceChargeKes") || undefined,
    sizeSqm: formData.get("sizeSqm") || undefined,
    tourEmbedUrl: formData.get("tourEmbedUrl") || undefined,
    videoUrl: formData.get("videoUrl") || undefined,
    areaId: formData.get("areaId"),
    estate: formData.get("estate"),
    streetAddress: formData.get("streetAddress"),
    lat: formData.get("lat") || undefined,
    lng: formData.get("lng") || undefined,
    bedrooms: formData.get("bedrooms") || 0,
    bathrooms: formData.get("bathrooms") || 0,
    furnished: formData.get("furnished") === "on" || formData.get("furnished") === "true",
    amenities: formData.getAll("amenities").map(String),
  });
}

// Listers can optionally drop a manual pin (MapPicker); when they don't, we
// silently geocode the address server-side so every listing still gets
// coordinates for the map/amenities modules — zero extra effort either way.
async function resolveGeo(input: {
  areaName: string | null;
  town: string;
  estate?: string | null;
  streetAddress: string;
  lat?: number;
  lng?: number;
}): Promise<{ lat: number | null; lng: number | null; geocodedAt: Date | null }> {
  if (input.lat != null && input.lng != null) {
    return { lat: input.lat, lng: input.lng, geocodedAt: null };
  }
  const geo = await geocodeAddress({
    streetAddress: input.streetAddress,
    estate: input.estate,
    areaName: input.areaName,
    town: input.town,
  });
  return geo
    ? { lat: geo.lat, lng: geo.lng, geocodedAt: new Date() }
    : { lat: null, lng: null, geocodedAt: null };
}

async function uniqueSlug(title: string) {
  const base = slugify(title) || "listing";
  let slug = base;
  let n = 1;
  while (await prisma.listing.findUnique({ where: { slug }, select: { id: true } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

export async function createListingAction(
  _prev: ListingFormState,
  formData: FormData
): Promise<ListingFormState> {
  const user = await requireLister();
  const parsed = parseListingForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const area = await prisma.area.findUnique({ where: { id: parsed.data.areaId } });
  if (!area) return { error: "Select a valid area" };

  const slug = await uniqueSlug(parsed.data.title);
  const geo = await resolveGeo({
    areaName: area.name,
    town: area.town,
    estate: parsed.data.estate,
    streetAddress: parsed.data.streetAddress,
    lat: parsed.data.lat,
    lng: parsed.data.lng,
  });

  let listingId: string;
  try {
    const listing = await prisma.listing.create({
      data: {
        listerId: user.id,
        title: parsed.data.title,
        slug,
        description: parsed.data.description,
        purpose: parsed.data.purpose,
        propertyType: parsed.data.propertyType,
        priceKes: parsed.data.priceKes,
        depositKes: parsed.data.depositKes ?? null,
        serviceChargeKes: parsed.data.serviceChargeKes ?? null,
        sizeSqm: parsed.data.sizeSqm ?? null,
        tourEmbedUrl: parsed.data.tourEmbedUrl ?? null,
        videoUrl: parsed.data.videoUrl ? toVideoEmbedUrl(parsed.data.videoUrl) : null,
        county: area.county,
        town: area.town,
        areaId: area.id,
        estate: parsed.data.estate || null,
        streetAddress: parsed.data.streetAddress,
        lat: geo.lat,
        lng: geo.lng,
        geocodedAt: geo.geocodedAt,
        bedrooms: parsed.data.bedrooms,
        bathrooms: parsed.data.bathrooms,
        furnished: parsed.data.furnished,
        amenities: parsed.data.amenities,
        status: "DRAFT",
      },
    });
    listingId = listing.id;
  } catch (e) {
    console.error("create listing failed", e);
    return { error: "Something went wrong creating the listing." };
  }

  redirect(`/dashboard/listings/${listingId}/edit`);
}

export async function updateListingAction(
  listingId: string,
  _prev: ListingFormState,
  formData: FormData
): Promise<ListingFormState> {
  const user = await requireLister();
  const existing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!existing || (existing.listerId !== user.id && user.role !== "ADMIN")) {
    return { error: "Listing not found" };
  }

  const parsed = parseListingForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const area = await prisma.area.findUnique({ where: { id: parsed.data.areaId } });
  if (!area) return { error: "Select a valid area" };

  const geo = await resolveGeo({
    areaName: area.name,
    town: area.town,
    estate: parsed.data.estate,
    streetAddress: parsed.data.streetAddress,
    lat: parsed.data.lat,
    lng: parsed.data.lng,
  });

  try {
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        purpose: parsed.data.purpose,
        propertyType: parsed.data.propertyType,
        priceKes: parsed.data.priceKes,
        depositKes: parsed.data.depositKes ?? null,
        serviceChargeKes: parsed.data.serviceChargeKes ?? null,
        sizeSqm: parsed.data.sizeSqm ?? null,
        tourEmbedUrl: parsed.data.tourEmbedUrl ?? null,
        videoUrl: parsed.data.videoUrl ? toVideoEmbedUrl(parsed.data.videoUrl) : null,
        county: area.county,
        town: area.town,
        areaId: area.id,
        estate: parsed.data.estate || null,
        streetAddress: parsed.data.streetAddress,
        lat: geo.lat,
        lng: geo.lng,
        geocodedAt: geo.geocodedAt,
        bedrooms: parsed.data.bedrooms,
        bathrooms: parsed.data.bathrooms,
        furnished: parsed.data.furnished,
        amenities: parsed.data.amenities,
        // Editing a submitted/live listing sends it back for re-review.
        status: ["SUBMITTED", "IN_VERIFICATION", "LIVE", "NEEDS_INFO"].includes(existing.status)
          ? "SUBMITTED"
          : existing.status,
      },
    });
  } catch (e) {
    console.error("update listing failed", e);
    return { error: "Something went wrong saving changes." };
  }

  revalidatePath(`/dashboard/listings/${listingId}/edit`);
  revalidatePath("/dashboard");
  return { error: undefined };
}

export async function submitListingAction(listingId: string) {
  const user = await requireLister();
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { images: true },
  });
  if (!listing || (listing.listerId !== user.id && user.role !== "ADMIN")) {
    throw new Error("Listing not found");
  }
  if (listing.images.length < MIN_LISTING_PHOTOS) {
    throw new Error(`Add at least ${MIN_LISTING_PHOTOS} photos before submitting.`);
  }

  // Already published once before (resubmission after edits / NEEDS_INFO) —
  // it already consumed a quota slot or was paid for; never charge twice.
  if (listing.publishedAt) {
    await prisma.listing.update({ where: { id: listingId }, data: { status: "SUBMITTED" } });
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/listings/${listingId}/edit`);
    return;
  }

  // First-ever publish — enforce the free-quota gate server-side (V2 §14.1).
  // The client never decides this; it only ever sees the outcome.
  const lister = await prisma.user.findUnique({ where: { id: listing.listerId } });
  const publishedCount = await prisma.listing.count({
    where: { listerId: listing.listerId, publishedAt: { not: null } },
  });
  const quota = lister?.freeListingQuota ?? FREE_LISTING_QUOTA;

  if (publishedCount < quota) {
    await prisma.listing.update({
      where: { id: listingId },
      data: { status: "SUBMITTED", publishedAt: new Date() },
    });
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/listings/${listingId}/edit`);
    return;
  }

  redirect(`/dashboard/listings/${listingId}/pay`);
}

// Listings expire 30 days after going LIVE (set on verification approval), not on submission —
// a backlog in the review queue shouldn't burn down a lister's clock before they're even verified.
export async function renewListingAction(listingId: string) {
  const user = await requireLister();
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || (listing.listerId !== user.id && user.role !== "ADMIN")) {
    throw new Error("Listing not found");
  }
  if (listing.status !== "LIVE") {
    throw new Error("Only live listings can be renewed");
  }

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lastConfirmedAt: new Date(),
    },
  });
  revalidatePath("/dashboard");
}

export async function deleteListingAction(listingId: string) {
  const user = await requireLister();
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { images: true },
  });
  if (!listing || (listing.listerId !== user.id && user.role !== "ADMIN")) {
    throw new Error("Listing not found");
  }

  await Promise.all(listing.images.map((img) => deleteCloudinaryImage(img.publicId)));
  await prisma.listing.delete({ where: { id: listingId } });
  revalidatePath("/dashboard");
}

const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
});

export async function addListingImageAction(
  listingId: string,
  image: { url: string; publicId: string }
) {
  const user = await requireLister();
  const parsed = imageSchema.safeParse(image);
  if (!parsed.success) throw new Error("Invalid image");

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || (listing.listerId !== user.id && user.role !== "ADMIN")) {
    throw new Error("Listing not found");
  }

  const count = await prisma.listingImage.count({ where: { listingId } });
  if (count >= MAX_LISTING_PHOTOS) {
    // The file already landed in Cloudinary via the client's direct upload — clean it
    // up rather than leaving an orphaned asset since we're rejecting the DB record.
    await deleteCloudinaryImage(parsed.data.publicId);
    throw new Error(`Listings can have at most ${MAX_LISTING_PHOTOS} photos.`);
  }
  await prisma.listingImage.create({
    data: {
      listingId,
      url: parsed.data.url,
      publicId: parsed.data.publicId,
      position: count,
      isCover: count === 0,
    },
  });
  revalidatePath(`/dashboard/listings/${listingId}/edit`);
}

export async function removeListingImageAction(listingId: string, imageId: string) {
  const user = await requireLister();
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || (listing.listerId !== user.id && user.role !== "ADMIN")) {
    throw new Error("Listing not found");
  }

  const image = await prisma.listingImage.findUnique({ where: { id: imageId } });
  if (!image || image.listingId !== listingId) throw new Error("Image not found");

  await prisma.listingImage.delete({ where: { id: imageId } });
  await deleteCloudinaryImage(image.publicId);

  if (image.isCover) {
    const next = await prisma.listingImage.findFirst({
      where: { listingId },
      orderBy: { position: "asc" },
    });
    if (next) {
      await prisma.listingImage.update({ where: { id: next.id }, data: { isCover: true } });
    }
  }
  revalidatePath(`/dashboard/listings/${listingId}/edit`);
}

export async function setCoverImageAction(listingId: string, imageId: string) {
  const user = await requireLister();
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || (listing.listerId !== user.id && user.role !== "ADMIN")) {
    throw new Error("Listing not found");
  }

  await prisma.$transaction([
    prisma.listingImage.updateMany({ where: { listingId }, data: { isCover: false } }),
    prisma.listingImage.update({ where: { id: imageId }, data: { isCover: true } }),
  ]);
  revalidatePath(`/dashboard/listings/${listingId}/edit`);
}

export async function unpublishListingAction(listingId: string) {
  const user = await requireLister();
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || (listing.listerId !== user.id && user.role !== "ADMIN")) {
    throw new Error("Listing not found");
  }
  await prisma.listing.update({ where: { id: listingId }, data: { status: "TAKEN" } });
  revalidatePath("/dashboard");
}

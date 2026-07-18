import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { PROPERTY_TYPE_LABELS } from "@/lib/listing-options";

export const alt = "Listing on Rollup Properties";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FOREST = "#1f4a3d";
const GOLD = "#d6ad4f";
const CREAM = "#faf7f1";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await prisma.listing.findUnique({
    where: { slug },
    select: {
      title: true,
      priceKes: true,
      purpose: true,
      propertyType: true,
      town: true,
      estate: true,
      verifiedAt: true,
      area: { select: { name: true } },
      images: { where: { isCover: true }, take: 1, select: { url: true } },
    },
  });

  const cover = listing?.images[0]?.url;
  const location = [listing?.estate, listing?.area?.name ?? listing?.town].filter(Boolean).join(", ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: FOREST,
        }}
      >
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            width={size.width}
            height={size.height}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: cover
              ? "linear-gradient(0deg, rgba(20,40,33,0.92) 0%, rgba(20,40,33,0.35) 55%, rgba(20,40,33,0.55) 100%)"
              : "none",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            width: "100%",
            padding: 64,
          }}
        >
          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            {listing?.verifiedAt && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: GOLD,
                  color: FOREST,
                  fontSize: 22,
                  fontWeight: 700,
                  padding: "8px 18px",
                  borderRadius: 999,
                }}
              >
                Verified
              </div>
            )}
            {listing?.propertyType && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(250,247,241,0.15)",
                  color: CREAM,
                  fontSize: 22,
                  fontWeight: 600,
                  padding: "8px 18px",
                  borderRadius: 999,
                }}
              >
                {PROPERTY_TYPE_LABELS[listing.propertyType]}
              </div>
            )}
          </div>
          <span
            style={{
              fontSize: 54,
              fontWeight: 700,
              color: CREAM,
              lineHeight: 1.15,
              maxWidth: 1000,
            }}
          >
            {listing?.title ?? "Verified property on Rollup"}
          </span>
          {location && (
            <span style={{ fontSize: 28, color: "#dbe6e0", marginTop: 12 }}>{location}</span>
          )}
          {listing && (
            <span style={{ fontSize: 40, fontWeight: 700, color: GOLD, marginTop: 20 }}>
              KES {listing.priceKes.toLocaleString()}
              {listing.purpose === "RENT" && (
                <span style={{ fontSize: 22, fontWeight: 400, color: "#dbe6e0" }}> /month</span>
              )}
            </span>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}

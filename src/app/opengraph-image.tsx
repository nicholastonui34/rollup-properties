import { ImageResponse } from "next/og";

export const alt = "Nyoomba — Verified homes to rent & buy in Kenya";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FOREST = "#1f4a3d";
const GOLD = "#d6ad4f";
const CREAM = "#faf7f1";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: FOREST,
          padding: 80,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: FOREST,
              border: `3px solid ${GOLD}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                border: `4px solid ${GOLD}`,
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 30, fontWeight: 700, color: CREAM, letterSpacing: -0.5 }}>
              Nyoomba
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
          <span style={{ fontSize: 68, fontWeight: 700, color: CREAM, lineHeight: 1.1 }}>
            Find a verified home.
          </span>
          <span style={{ fontSize: 68, fontWeight: 700, color: GOLD, lineHeight: 1.1 }}>
            Skip the broker.
          </span>
          <span style={{ fontSize: 26, color: "#c9d6cf", marginTop: 24 }}>
            Real photos · real addresses · direct manager contact
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}

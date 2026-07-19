import { ImageResponse } from "next/og";

const SIZE = 512;
const FOREST = "#1f4a3d";
const GOLD = "#d6ad4f";
const CREAM = "#faf7f1";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: FOREST,
        }}
      >
        <svg width={SIZE * 0.62} height={SIZE * 0.62} viewBox="0 0 32 32" fill="none">
          <path
            d="M6.5 15.5 16 7.5l9.5 8"
            stroke={GOLD}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 24.5c-3.6 0-6-2.2-6-5.1 0-2.5 2-4.4 4.6-4.4 2.2 0 3.8 1.5 3.8 3.5 0 1.7-1.3 2.9-3 2.9-1.3 0-2.2-.8-2.2-2"
            stroke={CREAM}
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { width: SIZE, height: SIZE }
  );
}

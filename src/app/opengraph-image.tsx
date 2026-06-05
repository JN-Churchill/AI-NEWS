import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#111111",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.24)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              letterSpacing: 4,
            }}
          >
            IDX
          </div>
          <div style={{ color: "#a7f3d0", fontSize: 28, letterSpacing: 6 }}>DAILY AI SIGNAL DESK</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, lineHeight: 1.05, fontWeight: 700 }}>{SITE_NAME}</div>
          <div style={{ marginTop: 28, maxWidth: 920, color: "#d4d4d4", fontSize: 34, lineHeight: 1.35 }}>
            {SITE_DESCRIPTION}
          </div>
        </div>
      </div>
    ),
    size,
  );
}

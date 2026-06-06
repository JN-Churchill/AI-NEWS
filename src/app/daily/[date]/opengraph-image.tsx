import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { getIssueByDate } from "@/lib/issues";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type DailyOgImageProps = {
  params: Promise<{
    date: string;
  }>;
};

function clampText(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

export default async function Image({ params }: DailyOgImageProps) {
  const { date } = await params;
  const issue = getIssueByDate(date);
  const title = issue?.title ?? SITE_NAME;
  const summary = issue?.summary ?? SITE_DESCRIPTION;
  const categories = issue?.categories.slice(0, 3) ?? [];

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
          padding: 64,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.24)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                letterSpacing: 4,
              }}
            >
              IDX
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", color: "#a7f3d0", fontSize: 24, letterSpacing: 5 }}>DAILY AI SIGNAL DESK</div>
              <div style={{ display: "flex", marginTop: 8, color: "#a3a3a3", fontSize: 22 }}>{SITE_NAME}</div>
            </div>
          </div>
          <div style={{ display: "flex", color: "#d4d4d4", fontSize: 28 }}>{date}</div>
        </div>

        <div style={{ display: "flex", gap: 46, alignItems: "flex-end" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", color: "#34d399", fontSize: 28, letterSpacing: 3 }}>AI SIGNAL ISSUE</div>
            <div style={{ display: "flex", marginTop: 18, fontSize: 72, lineHeight: 1.05, fontWeight: 700 }}>
              {clampText(title, 32)}
            </div>
            <div style={{ display: "flex", marginTop: 26, maxWidth: 780, color: "#d4d4d4", fontSize: 30, lineHeight: 1.35 }}>
              {clampText(summary, 72)}
            </div>
          </div>

          <div
            style={{
              width: 270,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.06)",
              padding: 26,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", color: "#a3a3a3", fontSize: 20 }}>Worth Index</div>
            <div style={{ display: "flex", marginTop: 10, fontSize: 82, lineHeight: 1, fontWeight: 700 }}>{issue?.totalScore ?? "--"}</div>
            <div style={{ display: "flex", marginTop: 18, color: "#d4d4d4", fontSize: 22 }}>{issue?.selectedCount ?? 0} selected signals</div>
            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
              {categories.map((category) => (
                <div
                  key={category.slug}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    color: "#ecfdf5",
                    fontSize: 20,
                  }}
                >
                  <span>{category.name}</span>
                  <span style={{ color: "#34d399" }}>{category.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}

import Link from "next/link";
import type { DailyIssue } from "@/interfaces/issue";

type SidebarPanelProps = {
  issue: DailyIssue;
};

export function SidebarPanel({ issue }: SidebarPanelProps) {
  const totalEditions = parseInt(issue.issueNo, 10) || 0;

  return (
    <aside className="lg:sticky lg:top-[72px] lg:self-start">
      <div className="surface-panel p-5">
        {/* Total score */}
        <div className="flex items-baseline gap-1.5" style={{ marginBottom: "20px" }}>
          <span
            style={{
              fontSize: "32px",
              fontWeight: 700,
              color: "var(--ink)",
              letterSpacing: "-1px",
              lineHeight: 1,
            }}
          >
            {issue.totalScore}
          </span>
          <span style={{ fontSize: "13px", color: "var(--muted)" }}>
            / 100
          </span>
        </div>

        {/* Category links with scores */}
        <div className="space-y-1.5" style={{ marginBottom: "20px" }}>
          {issue.categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/?category=${cat.slug}`}
              className="flex items-center justify-between py-1 text-[13px] transition-colors hover-accent"
              style={{ color: "var(--ink-soft)" }}
            >
              <span>{cat.name}</span>
              <span
                className="font-mono-ui text-[12px]"
                style={{ color: "var(--muted)" }}
              >
                {cat.score}
              </span>
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderBottom: "0.5px solid var(--line)", marginBottom: "16px" }} />

        {/* Archive link */}
        <Link
          href="/archive"
          className="text-[13px] font-medium transition-colors hover-accent"
          style={{ color: "var(--accent)" }}
        >
          All {totalEditions} Editions &rarr;
        </Link>

        {/* Quick stats row */}
        <div
          className="mt-4 grid grid-cols-3 gap-2 pt-4"
          style={{ borderTop: "0.5px solid var(--line)" }}
        >
          <div>
            <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>
              {issue.candidateCount}
            </p>
            <p className="mono-label" style={{ marginTop: "2px", fontSize: "9px" }}>
              CANDIDATES
            </p>
          </div>
          <div>
            <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>
              {issue.selectedCount}
            </p>
            <p className="mono-label" style={{ marginTop: "2px", fontSize: "9px" }}>
              SELECTED
            </p>
          </div>
          <div>
            <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>
              {issue.readingMinutes}
            </p>
            <p className="mono-label" style={{ marginTop: "2px", fontSize: "9px" }}>
              MIN READ
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

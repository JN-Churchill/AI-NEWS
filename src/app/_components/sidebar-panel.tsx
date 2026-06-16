import Link from "next/link";
import type { DailyIssue } from "@/interfaces/issue";

type SidebarPanelProps = {
  issue: DailyIssue;
};

export function SidebarPanel({ issue }: SidebarPanelProps) {
  const totalEditions = parseInt(issue.issueNo, 10) || 0;

  return (
    <aside className="space-y-8 lg:sticky lg:top-[120px] lg:self-start">
      {/* Block 1: Overall Score */}
      <section>
        <p className="section-kicker" style={{ marginBottom: "12px" }}>
          SIGNAL INDEX
        </p>
        <div className="flex items-baseline gap-2" style={{ marginBottom: "16px" }}>
          <span
            className="font-mono-ui"
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "var(--ink)",
              letterSpacing: "-1px",
              lineHeight: 1,
            }}
          >
            {issue.totalScore}
          </span>
          <span
            className="font-mono-ui"
            style={{ fontSize: "12px", color: "var(--muted)" }}
          >
            / 100
          </span>
        </div>

        {/* Category score bars */}
        <div className="space-y-2.5">
          {issue.categories.map((cat) => {
            const maxScore = Math.max(...issue.categories.map((c) => c.score), 1);
            const pct = (cat.score / maxScore) * 100;
            return (
              <Link
                key={cat.slug}
                href={`/?category=${cat.slug}`}
                className="group flex items-center gap-3 hover-bg"
                style={{ padding: "4px 6px", marginLeft: "-6px", marginRight: "-6px" }}
              >
                <span
                  className="font-mono-ui shrink-0"
                  style={{
                    fontSize: "9px",
                    letterSpacing: "1.6px",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    width: "56px",
                  }}
                >
                  {cat.name}
                </span>
                <div
                  className="relative h-2 flex-1 overflow-hidden"
                  style={{ background: "var(--line)" }}
                >
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      background: "var(--accent)",
                    }}
                  />
                </div>
                <span
                  className="font-mono-ui shrink-0 text-right"
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "var(--ink-soft)",
                    width: "24px",
                  }}
                >
                  {cat.score}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Divider */}
      <div style={{ borderBottom: "0.8px solid var(--line)" }} />

      {/* Block 2: Archive entry */}
      <section>
        <p className="section-kicker" style={{ marginBottom: "8px" }}>
          ARCHIVE
        </p>
        <Link
          href="/archive"
          className="font-mono-ui text-[12px] tracking-[0.5px] transition-colors hover-accent"
          style={{ color: "var(--ink-soft)" }}
        >
          View All {totalEditions} Editions &rarr;
        </Link>
      </section>

      {/* Block 3: Quick stats */}
      <section>
        <div
          className="grid grid-cols-3 gap-4 py-4"
          style={{ borderTop: "0.8px solid var(--line)", borderBottom: "0.8px solid var(--line)" }}
        >
          <div>
            <p
              className="font-mono-ui"
              style={{ fontSize: "20px", fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}
            >
              {issue.candidateCount}
            </p>
            <p className="mono-label" style={{ marginTop: "4px", fontSize: "9px" }}>
              CANDIDATES
            </p>
          </div>
          <div>
            <p
              className="font-mono-ui"
              style={{ fontSize: "20px", fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}
            >
              {issue.selectedCount}
            </p>
            <p className="mono-label" style={{ marginTop: "4px", fontSize: "9px" }}>
              SELECTED
            </p>
          </div>
          <div>
            <p
              className="font-mono-ui"
              style={{ fontSize: "20px", fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}
            >
              {issue.readingMinutes}
            </p>
            <p className="mono-label" style={{ marginTop: "4px", fontSize: "9px" }}>
              MIN READ
            </p>
          </div>
        </div>
      </section>
    </aside>
  );
}

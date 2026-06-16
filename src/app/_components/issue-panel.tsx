import Link from "next/link";
import type { DailyIssue } from "@/interfaces/issue";

type IssuePanelProps = {
  issue: DailyIssue;
};

function formatIssueDate(date: string) {
  return new Date(`${date}T08:00:00+08:00`).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

export function IssuePanel({ issue }: IssuePanelProps) {
  return (
    <section
      className="mx-auto w-full max-w-[1088px] px-5 sm:px-6"
      style={{ padding: "16px 0" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 sm:px-6">
        {/* Left: bilingual section header */}
        <span className="mono-label">
          今日精选 · TODAY&apos;S PICKS
        </span>

        {/* Right: date + issue no + status */}
        <div className="flex items-center gap-3 text-[12px]" style={{ color: "var(--muted)" }}>
          <time className="font-mono-ui text-[11px] tracking-[0.5px]">
            {formatIssueDate(issue.date)}
          </time>
          <span className="h-3 w-px" style={{ background: "var(--line-heavy)" }} />
          <span className="font-mono-ui text-[11px] tracking-[1px]">
            #{issue.issueNo}
          </span>
          <span className="h-3 w-px" style={{ background: "var(--line-heavy)" }} />
          <span className="inline-flex items-center gap-1.5 font-mono-ui text-[11px] tracking-[0.5px]">
            <span
              className="h-1.5 w-1.5"
              style={{
                background: issue.status === "published" ? "#4ade80" : "#fbbf24",
              }}
            />
            {issue.status === "published" ? "Published" : "Draft"}
          </span>
          <Link
            href={`/daily/${issue.date}`}
            className="font-mono-ui text-[11px] tracking-[1px] uppercase transition-colors hover-accent"
            style={{ color: "var(--ink-soft)" }}
          >
            Full Report &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import type { DailyIssue } from "@/interfaces/issue";

type IssuePanelProps = {
  issue: DailyIssue;
};

function formatIssueDate(date: string) {
  return new Date(`${date}T08:00:00+08:00`).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  });
}

export function IssuePanel({ issue }: IssuePanelProps) {
  return (
    <section className="mx-auto w-full max-w-[960px] px-5 sm:px-6">
      <div
        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1"
        style={{ padding: "12px 0" }}
      >
        {/* Left: date + issue number */}
        <div className="flex items-center gap-3 text-[13px]" style={{ color: "var(--muted)" }}>
          <time>{formatIssueDate(issue.date)}</time>
          <span style={{ color: "var(--line-heavy)" }}>|</span>
          <span>#{issue.issueNo}</span>
        </div>

        {/* Right: Full Report link */}
        <Link
          href={`/daily/${issue.date}`}
          className="text-[13px] font-medium transition-colors hover-accent"
          style={{ color: "var(--accent)" }}
        >
          Full Report &rarr;
        </Link>
      </div>
    </section>
  );
}

import Link from "next/link";
import type { DailyIssue } from "@/interfaces/issue";

type IssuePanelProps = {
  issue: DailyIssue;
};

export function IssuePanel({ issue }: IssuePanelProps) {
  return (
    <section className="border-b border-neutral-900 bg-neutral-950 text-white">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        {/* Meta line */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-400">
          <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-medium text-white">
            {issue.date}
          </span>
          <span className="text-xs">第 {issue.issueNo} 期</span>
          {issue.status === "demo" && (
            <span className="text-xs text-amber-400">样例数据</span>
          )}
        </div>

        {/* Title */}
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400">
          Daily Signal Brief
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
          {issue.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
          {issue.summary}
        </p>

        {/* Category tags + stats inline */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {issue.categories.map((category) => (
            <Link
              key={category.slug}
              href={`/?category=${category.slug}`}
              className="rounded border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-neutral-300 transition hover:border-white/30 hover:bg-white/10"
            >
              {category.name}
              <span className="ml-1 text-neutral-500">{category.score}</span>
            </Link>
          ))}

          <span className="ml-auto flex items-center gap-4 text-xs text-neutral-500">
            <span>
              <span className="font-semibold text-white">{issue.candidateCount}</span> 候选
            </span>
            <span>
              <span className="font-semibold text-white">{issue.selectedCount}</span> 入选
            </span>
            <span>
              <span className="font-semibold text-white">{issue.totalScore}</span> 指数
            </span>
            <span>{issue.readingMinutes} 分钟</span>
          </span>
        </div>
      </div>
    </section>
  );
}

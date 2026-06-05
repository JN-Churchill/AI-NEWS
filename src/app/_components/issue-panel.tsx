import Link from "next/link";
import type { DailyIssue } from "@/interfaces/issue";
import { ScoreMeter } from "@/app/_components/score-meter";

type IssuePanelProps = {
  issue: DailyIssue;
};

export function IssuePanel({ issue }: IssuePanelProps) {
  const topCategories = issue.categories.slice(0, 5);

  return (
    <section className="border-b border-neutral-900 bg-neutral-950 text-white">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-300">
              <span className="rounded bg-white/10 px-2 py-1 font-medium text-white">{issue.date}</span>
              <span>第 {issue.issueNo} 期</span>
              <span>{issue.status === "demo" ? "样例数据" : "已发布"}</span>
            </div>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
              Daily Signal Brief
            </p>
            <h1 className="mt-4 max-w-4xl text-balance text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
              {issue.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-300">{issue.summary}</p>

            <div className="mt-7 flex flex-wrap gap-2">
              {topCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/?category=${category.slug}`}
                  className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-neutral-200 transition hover:border-white/35 hover:bg-white/10"
                >
                  {category.name} {category.score}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="text-sm text-neutral-300">今日指数</p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <p className="text-7xl font-semibold leading-none">{issue.totalScore}</p>
              <p className="pb-2 text-sm text-neutral-400">{issue.readingMinutes} 分钟读完</p>
            </div>
            <div className="mt-5">
              <ScoreMeter score={issue.totalScore} size="lg" />
            </div>

            <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 text-sm">
              <div className="bg-neutral-950 p-3">
                <dt className="text-neutral-400">候选</dt>
                <dd className="mt-1 text-2xl font-semibold">{issue.candidateCount}</dd>
              </div>
              <div className="bg-neutral-950 p-3">
                <dt className="text-neutral-400">入选</dt>
                <dd className="mt-1 text-2xl font-semibold">{issue.selectedCount}</dd>
              </div>
              <div className="bg-neutral-950 p-3">
                <dt className="text-neutral-400">分类</dt>
                <dd className="mt-1 text-2xl font-semibold">{issue.categories.length}</dd>
              </div>
            </dl>

            <div className="mt-6 space-y-3">
              {topCategories.map((category) => (
                <div key={category.slug}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-neutral-300">{category.name}</span>
                    <span className="font-semibold text-white">{category.score}</span>
                  </div>
                  <ScoreMeter score={category.score} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

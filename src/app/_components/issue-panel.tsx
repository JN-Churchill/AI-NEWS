import Link from "next/link";
import Image from "next/image";
import type { DailyIssue } from "@/interfaces/issue";
import { ScoreMeter } from "@/app/_components/score-meter";

type IssuePanelProps = {
  issue: DailyIssue;
};

function statusLabel(status: DailyIssue["status"]) {
  if (status === "draft") {
    return "草稿复核中";
  }

  return "已发布";
}

export function IssuePanel({ issue }: IssuePanelProps) {
  const topCategories = issue.categories.slice(0, 5);
  const sourceCount = new Set(issue.items.map((item) => item.source)).size;

  return (
    <section className="ink-panel border-b border-neutral-950 text-white">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-300">
              <span className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1 text-white">{issue.date}</span>
              <span className="rounded-md border border-white/10 px-2.5 py-1">第 {issue.issueNo} 期</span>
              <span className="rounded-md border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 text-emerald-200">
                {statusLabel(issue.status)}
              </span>
            </div>

            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
              Daily Intelligence Brief
            </p>
            <h1 className="mt-4 max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {issue.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-300">{issue.summary}</p>

            <div className="mt-7 flex flex-wrap gap-2">
              {topCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/?category=${category.slug}`}
                  className="rounded-md border border-white/15 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-neutral-200 transition hover:border-emerald-300/50 hover:bg-emerald-300/10 hover:text-white"
                >
                  {category.name}
                  <span className="ml-2 text-emerald-300">{category.score}</span>
                </Link>
              ))}
            </div>
          </div>

          <aside className="rounded-md border border-white/15 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-md border border-white/10 bg-neutral-900">
              <Image
                src="/hero-intelligence-desk.jpg"
                alt="AI 情报编辑台视觉"
                fill
                priority
                sizes="(min-width: 1024px) 380px, 100vw"
                className="object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/55 via-transparent to-transparent" />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">Worth Index</p>
                <p className="mt-2 text-sm text-neutral-300">今日值得读指数</p>
              </div>
              <Link
                href={`/daily/${issue.date}`}
                className="rounded-md border border-white/15 px-3 py-1.5 text-sm font-semibold text-neutral-200 transition hover:border-white/35 hover:bg-white/10"
              >
                详情
              </Link>
            </div>

            <div className="mt-5 flex items-end justify-between gap-4">
              <p className="text-7xl font-semibold leading-none tracking-tight">{issue.totalScore}</p>
              <p className="pb-2 text-right text-xs leading-5 text-neutral-400">
                满分 100
                <br />
                {issue.readingMinutes} 分钟读完
              </p>
            </div>
            <div className="mt-5">
              <ScoreMeter score={issue.totalScore} size="lg" />
            </div>

            <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 text-sm">
              {[
                ["候选", issue.candidateCount],
                ["入选", issue.selectedCount],
                ["来源", sourceCount],
              ].map(([label, value]) => (
                <div key={label} className="bg-neutral-950/60 p-3">
                  <dt className="text-xs text-neutral-400">{label}</dt>
                  <dd className="mt-1 text-2xl font-semibold text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </div>
    </section>
  );
}

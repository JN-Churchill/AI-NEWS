import Link from "next/link";
import type { DailyIssue } from "@/interfaces/issue";
import { ScoreMeter } from "@/app/_components/score-meter";

type SidebarPanelProps = {
  issue: DailyIssue;
};

export function SidebarPanel({ issue }: SidebarPanelProps) {
  const sourceCount = new Set(issue.items.map((item) => item.source)).size;
  const topItems = issue.items.slice(0, 5);

  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <section className="editorial-card rounded-md p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">Index Board</p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-700">值得读指数</p>
            <p className="mt-2 text-5xl font-semibold leading-none tracking-tight text-neutral-950">{issue.totalScore}</p>
          </div>
          <p className="pb-1 text-right text-xs leading-5 text-neutral-400">
            {issue.selectedCount} 条入选
            <br />
            {issue.readingMinutes} 分钟
          </p>
        </div>
        <div className="mt-4">
          <ScoreMeter score={issue.totalScore} size="lg" />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-neutral-200 bg-neutral-200 text-center">
          {[
            ["候选", issue.candidateCount],
            ["来源", sourceCount],
            ["分类", issue.categories.length],
          ].map(([label, value]) => (
            <div key={label} className="bg-white p-3">
              <p className="text-[11px] text-neutral-400">{label}</p>
              <p className="mt-1 text-xl font-semibold text-neutral-950">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="editorial-card rounded-md p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">Pulse</p>
          <Link href={`/daily/${issue.date}`} className="text-xs font-semibold text-emerald-700 transition hover:text-emerald-900">
            完整日报
          </Link>
        </div>
        <div className="mt-4 space-y-4">
          {issue.categories.map((category) => (
            <Link key={category.slug} href={`/?category=${category.slug}`} className="block">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-neutral-800">{category.name}</span>
                <span className="text-neutral-500">{category.score}</span>
              </div>
              <ScoreMeter score={category.score} />
            </Link>
          ))}
        </div>
      </section>

      <section className="editorial-card rounded-md p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">Top Queue</p>
        <div className="mt-4 space-y-3">
          {topItems.map((item) => (
            <Link key={item.rank} href={`/daily/${issue.date}#signal-${item.rank}`} className="group block">
              <div className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded bg-neutral-100 text-[11px] font-semibold text-neutral-600 group-hover:bg-neutral-950 group-hover:text-white">
                  {item.rank}
                </span>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-semibold leading-5 text-neutral-800 group-hover:text-emerald-800">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">{item.source}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </aside>
  );
}

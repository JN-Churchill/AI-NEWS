import Link from "next/link";
import type { DailyIssue } from "@/interfaces/issue";
import { ScoreMeter } from "@/app/_components/score-meter";

type SidebarPanelProps = {
  issue: DailyIssue;
};

export function SidebarPanel({ issue }: SidebarPanelProps) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
      {/* Score Index */}
      <section className="border-b border-neutral-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Worth Reading
        </p>
        <p className="mt-2 text-sm font-medium text-neutral-600">值得看指数</p>
        <div className="mt-3 flex items-end gap-3">
          <span className="text-5xl font-semibold leading-none text-neutral-950">
            {issue.totalScore}
          </span>
          <span className="pb-1 text-xs text-neutral-400">总评分 · 满分 100</span>
        </div>
        <div className="mt-4">
          <ScoreMeter score={issue.totalScore} size="lg" />
        </div>

        {/* Stats row */}
        <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-neutral-200 bg-neutral-200 text-sm">
          <div className="bg-white p-3 text-center">
            <p className="text-xs text-neutral-400">候选</p>
            <p className="mt-1 text-xl font-semibold text-neutral-950">{issue.candidateCount}</p>
          </div>
          <div className="bg-white p-3 text-center">
            <p className="text-xs text-neutral-400">入选</p>
            <p className="mt-1 text-xl font-semibold text-neutral-950">{issue.selectedCount}</p>
          </div>
          <div className="bg-white p-3 text-center">
            <p className="text-xs text-neutral-400">阅读</p>
            <p className="mt-1 text-xl font-semibold text-neutral-950">{issue.readingMinutes}m</p>
          </div>
        </div>
      </section>

      {/* Category Pulse */}
      <section className="border-b border-neutral-200 pb-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Pulse
          </p>
          <Link
            href={`/daily/${issue.date}`}
            className="text-xs font-medium text-neutral-500 hover:text-neutral-950 transition"
          >
            详情
          </Link>
        </div>
        <p className="mt-2 text-sm font-medium text-neutral-600">分类热度</p>
        <div className="mt-4 space-y-3">
          {issue.categories.map((category) => (
            <div key={category.slug}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-700">{category.name}</span>
                <span className="text-neutral-400">{category.score}</span>
              </div>
              <ScoreMeter score={category.score} />
            </div>
          ))}
        </div>
      </section>

      {/* Source Mix */}
      <section className="border-b border-neutral-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Source Mix
        </p>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-neutral-600">入选来源</span>
          <span className="font-semibold text-neutral-950">
            {new Set(issue.items.map((item) => item.source)).size}
          </span>
        </div>
      </section>

      {/* About blurb */}
      <section>
        <p className="text-xs leading-5 text-neutral-400 italic">
          &quot;AI 信号指数&quot; 是一套基于多维度量化算法的评估体系，每日从 AI 行业新闻、论文、开源项目和产品更新中筛选最具决策价值的信号。
        </p>
      </section>
    </aside>
  );
}

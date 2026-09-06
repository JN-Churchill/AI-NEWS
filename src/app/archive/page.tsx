import Link from "next/link";
import { ArrowRight, Flame, Layers } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { formatDateCn, getAllIssues, groupIssuesByMonth, weekdayCn } from "@/lib/content";

export const metadata = {
  title: "历史归档",
  description: "往期 AI 日报归档，按月份回溯每日热点与热度指数。",
};

export default function ArchivePage() {
  const issues = getAllIssues();
  const groups = groupIssuesByMonth(issues);
  const totalItems = issues.reduce((sum, issue) => sum + issue.stats.total, 0);

  return (
    <div className="pb-4">
      <section className="pt-8">
        <h1 className="text-[clamp(26px,4.4vw,38px)] font-extrabold leading-tight tracking-[-0.02em]">
          历史<span className="gradient-text">归档</span>
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--color-ink-2)]">
          共 {issues.length} 期日报、{totalItems} 条热点信号，每天自动抓取并归档，可随时回溯任意一天的行业快照。
        </p>
      </section>

      {issues.length === 0 && (
        <div className="glass mt-10 p-10 text-center text-[14px] text-[var(--color-ink-2)]">
          暂无归档内容，运行采集与生成脚本后即可看到往期日报。
        </div>
      )}

      {groups.map((group) => (
        <section key={group.month} className="mt-12">
          <div className="flex items-center gap-3 pb-3.5">
            <h2 className="text-[18px] font-bold tracking-[-0.01em]">
              {group.month.replace("-", " 年 ")} 月
            </h2>
            <span className="chip font-mono">{group.items.length} 期</span>
            <span className="section-rule ml-1 hidden flex-1 sm:block" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {group.items.map((issue, index) => (
              <Reveal key={issue.date} delay={index * 50}>
                <Link href={`/daily/${issue.date}`} className="card h-full p-5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[15px] font-bold">{issue.date}</span>
                    <span className="text-[12px] text-[var(--color-ink-3)]">{weekdayCn(issue.date)}</span>
                  </div>

                  <p className="mt-2.5 line-clamp-2 text-[13.5px] leading-relaxed text-[var(--color-ink-2)]">
                    {issue.lead}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-[var(--color-ink-3)]">
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5" />
                      {issue.stats.total} 条
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-[var(--color-brand-1)]" />
                      热度 {issue.stats.avgHeat.toFixed(1)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-brand-1)]">
                    {formatDateCn(issue.date)}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

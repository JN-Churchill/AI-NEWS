import Link from "next/link";
import { ArrowRight, CalendarDays, Flame, Layers, Rss, Radio } from "lucide-react";

import { HeatGauge } from "@/components/heat-gauge";
import { Reveal } from "@/components/reveal";
import { SectionBlock } from "@/components/section-block";
import { SectionHeatChart } from "@/components/section-heat-chart";
import { ItemCard } from "@/components/item-card";
import { SectionNav } from "@/components/section-nav";
import { formatDateCn, getLatestIssue, weekdayCn } from "@/lib/content";
import { SECTION_DEFS, sectionMeta } from "@/types/schema";

/** 把 ISO 时间显示为北京时间 */
function bjtClock(iso: string): string {
  const date = new Date(new Date(iso).getTime() + 8 * 3_600_000);
  return `${String(date.getUTCMonth() + 1)}月${String(date.getUTCDate()).padStart(2, "0")}日 ${String(
    date.getUTCHours(),
  ).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

export default function HomePage() {
  const issue = getLatestIssue();

  if (!issue) {
    return (
      <div className="glass-strong mx-auto mt-16 max-w-[560px] p-10 text-center">
        <h1 className="text-[24px] font-extrabold">还没有生成日报</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-ink-2)]">
          运行 <code className="rounded bg-white/8 px-1.5 py-0.5 font-mono text-[13px]">npm run ingest</code> 抓取今日热点，
          再运行 <code className="rounded bg-white/8 px-1.5 py-0.5 font-mono text-[13px]">npm run issue:build</code> 生成日报。
        </p>
      </div>
    );
  }

  const allItems = issue.sections.flatMap((section) => section.items);
  const topItems = [...allItems].sort((a, b) => b.heatScore - a.heatScore).slice(0, 5);
  const navSections = issue.sections.map((section) => ({
    slug: section.slug,
    short: sectionMeta(section.slug).short,
    count: section.items.length,
  }));
  const chartData = SECTION_DEFS.map((definition) => {
    const hit = issue.stats.bySection.find((item) => item.slug === definition.slug);
    return { name: definition.short, heat: hit?.avgHeat ?? 0, count: hit?.count ?? 0 };
  }).filter((point) => point.count > 0);

  const metrics = [
    { icon: Layers, label: "入选条目", value: String(issue.stats.total), unit: "条" },
    { icon: Flame, label: "平均热度", value: issue.stats.avgHeat.toFixed(1), unit: "分" },
    { icon: Radio, label: "信息来源", value: String(issue.stats.sourceCount), unit: "个" },
    { icon: Rss, label: "跨源热点", value: String(issue.stats.crossSourceCount), unit: "条" },
  ];

  return (
    <div className="pb-4">
      {/* Hero */}
      <section className="pt-8 pb-4 text-center">
        <span className="glass inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[13px] text-[var(--color-ink-2)]">
          <span className="live-dot" />
          {formatDateCn(issue.date)} · {weekdayCn(issue.date)}
        </span>

        <h1 className="mt-7 text-[clamp(30px,5.4vw,50px)] font-extrabold leading-[1.16] tracking-[-0.02em]">
          今日 AI 动向
          <br />
          <span className="gradient-text">五分钟看完</span>
        </h1>

        <p className="mx-auto mt-5 max-w-[640px] text-[15px] leading-relaxed text-[var(--color-ink-2)]">
          {issue.lead}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[12.5px] text-[var(--color-ink-3)]">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            覆盖 {bjtClock(issue.window.start)} — {bjtClock(issue.window.end)}（北京时间）
          </span>
          <span className="hidden sm:inline">·</span>
          <span>候选 {issue.candidateCount} 条筛选而来</span>
        </div>
      </section>

      {/* 信号指数仪表盘 */}
      <Reveal>
        <section className="glass-strong mt-8 grid grid-cols-1 gap-7 p-7 lg:grid-cols-[auto_1fr]">
          <div className="flex items-center justify-center">
            <HeatGauge value={issue.stats.avgHeat} label="本期综合热度" />
          </div>

          <div className="flex flex-col justify-center gap-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="glass p-4">
                  <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--color-ink-3)]">
                    <metric.icon className="h-3.5 w-3.5" />
                    {metric.label}
                  </div>
                  <div className="mt-1.5 font-mono text-[24px] font-extrabold leading-none gradient-text">
                    {metric.value}
                    <span className="ml-1 text-[12px] font-medium text-[var(--color-ink-3)]">{metric.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass p-4">
              <div className="mb-2 flex items-center justify-between text-[12.5px] text-[var(--color-ink-3)]">
                <span>各版块平均热度分布</span>
                <span>共 {issue.stats.total} 条</span>
              </div>
              <SectionHeatChart data={chartData} />
            </div>
          </div>
        </section>
      </Reveal>

      {/* 今日热点榜 */}
      <Reveal>
        <section className="mt-14">
          <div className="flex items-center gap-3 pb-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-1)] to-[var(--color-brand-3)] text-[#05121a]">
              <Flame className="h-4 w-4" />
            </span>
            <h2 className="text-[19px] font-bold tracking-[-0.01em]">今日热点榜 Top 5</h2>
            <span className="section-rule ml-2 hidden flex-1 sm:block" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topItems.map((item, index) => (
              <ItemCard key={item.id} item={item} rank={index + 1} />
            ))}
          </div>
        </section>
      </Reveal>

      {/* 版块锚点导航 */}
      <SectionNav sections={navSections} />

      {/* 五大版块 */}
      {issue.sections.map((section) => (
        <SectionBlock key={section.slug} section={section} />
      ))}

      {/* 订阅 CTA */}
      <Reveal>
        <section className="glass-strong mt-16 flex flex-col items-center gap-5 p-9 text-center">
          <h2 className="text-[22px] font-extrabold tracking-[-0.01em]">每天自动更新，不错过关键变化</h2>
          <p className="max-w-[520px] text-[14px] leading-relaxed text-[var(--color-ink-2)]">
            通过 RSS 或 JSON Feed 订阅，把每日 AI 日报直接送进你的阅读器。所有内容由定时任务自动生成，无需人工干预。
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="/rss.xml" className="btn btn-primary">
              <Rss className="h-4 w-4" />
              订阅 RSS
            </a>
            <Link href="/archive" className="btn btn-ghost">
              浏览历史归档
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="text-[12px] text-[var(--color-ink-3)]">
            数据来源：{issue.attribution.name} 及 {issue.stats.sourceCount} 个公开来源聚合
          </p>
        </section>
      </Reveal>
    </div>
  );
}

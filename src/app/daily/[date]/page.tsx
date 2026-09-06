import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Flame, Layers, Radio } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { SectionBlock } from "@/components/section-block";
import { formatDateCn, getAllIssues, getIssue, getNeighbourIssues, weekdayCn } from "@/lib/content";

export function generateStaticParams() {
  return getAllIssues().map((issue) => ({ date: issue.date }));
}

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const issue = getIssue(date);
  return {
    title: issue ? `${formatDateCn(date)} AI 日报` : "AI 日报",
    description: issue?.lead,
  };
}

function bjtClock(iso: string): string {
  const date = new Date(new Date(iso).getTime() + 8 * 3_600_000);
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

export default async function DailyPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const issue = getIssue(date);

  if (!issue) notFound();

  const { prev, next } = getNeighbourIssues(date);
  const metrics = [
    { icon: Layers, label: "入选条目", value: `${issue.stats.total} 条` },
    { icon: Flame, label: "平均热度", value: issue.stats.avgHeat.toFixed(1) },
    { icon: Radio, label: "跨源热点", value: `${issue.stats.crossSourceCount} 条` },
  ];

  return (
    <div className="pb-4">
      <section className="pt-8">
        <Link
          href="/archive"
          className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-ink-3)] transition-colors hover:text-[var(--color-brand-1)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回归档
        </Link>

        <h1 className="mt-5 text-[clamp(26px,4.6vw,40px)] font-extrabold leading-[1.2] tracking-[-0.02em]">
          {formatDateCn(issue.date)}
          <span className="ml-3 align-middle text-[15px] font-medium text-[var(--color-ink-3)]">
            {weekdayCn(issue.date)}
          </span>
        </h1>

        <p className="mt-4 max-w-[680px] text-[14.5px] leading-relaxed text-[var(--color-ink-2)]">
          {issue.lead}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          {metrics.map((metric) => (
            <span key={metric.label} className="flex items-center gap-2 text-[13px] text-[var(--color-ink-2)]">
              <metric.icon className="h-3.5 w-3.5 text-[var(--color-brand-1)]" />
              {metric.label}
              <strong className="font-mono text-[14px] text-[var(--color-ink-1)]">{metric.value}</strong>
            </span>
          ))}
          <span className="flex items-center gap-2 text-[13px] text-[var(--color-ink-3)]">
            <CalendarDays className="h-3.5 w-3.5" />
            {bjtClock(issue.window.start)} — {bjtClock(issue.window.end)}（北京时间）
          </span>
        </div>
      </section>

      {issue.sections.map((section) => (
        <SectionBlock key={section.slug} section={section} />
      ))}

      <Reveal>
        <nav className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {prev ? (
            <Link href={`/daily/${prev.date}`} className="card p-5">
              <span className="flex items-center gap-1.5 text-[12.5px] text-[var(--color-ink-3)]">
                <ArrowLeft className="h-3.5 w-3.5" />
                上一期
              </span>
              <span className="mt-2 block text-[15px] font-bold">{formatDateCn(prev.date)}</span>
              <span className="mt-1 block text-[12.5px] text-[var(--color-ink-3)]">
                {prev.stats.total} 条 · 平均热度 {prev.stats.avgHeat.toFixed(1)}
              </span>
            </Link>
          ) : (
            <span />
          )}

          {next && (
            <Link href={`/daily/${next.date}`} className="card p-5 sm:text-right">
              <span className="flex items-center gap-1.5 text-[12.5px] text-[var(--color-ink-3)] sm:justify-end">
                下一期
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
              <span className="mt-2 block text-[15px] font-bold">{formatDateCn(next.date)}</span>
              <span className="mt-1 block text-[12.5px] text-[var(--color-ink-3)]">
                {next.stats.total} 条 · 平均热度 {next.stats.avgHeat.toFixed(1)}
              </span>
            </Link>
          )}
        </nav>
      </Reveal>
    </div>
  );
}

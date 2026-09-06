import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ItemCard } from "@/components/item-card";
import { Reveal } from "@/components/reveal";
import { getAllIssues } from "@/lib/content";
import { TOPIC_DEFS, type UnifiedItem } from "@/types/schema";

export function generateStaticParams() {
  return TOPIC_DEFS.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = TOPIC_DEFS.find((item) => item.slug === slug);
  return {
    title: topic ? `${topic.name}主题` : "主题",
    description: topic ? `与${topic.name}相关的 AI 日报热点信号汇总。` : undefined,
  };
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = TOPIC_DEFS.find((item) => item.slug === slug);

  if (!topic) notFound();

  const items: UnifiedItem[] = getAllIssues()
    .flatMap((issue) => issue.sections.flatMap((section) => section.items))
    .filter((item) => item.topics.includes(slug))
    .sort((a, b) => b.heatScore - a.heatScore);

  return (
    <div className="pb-4">
      <section className="pt-8">
        <Link
          href="/topics"
          className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-ink-3)] transition-colors hover:text-[var(--color-brand-1)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回主题列表
        </Link>

        <h1 className="mt-5 text-[clamp(26px,4.4vw,38px)] font-extrabold leading-tight tracking-[-0.02em]">
          {topic.name}
          <span className="ml-3 align-middle text-[15px] font-medium text-[var(--color-ink-3)]">
            {items.length} 条信号
          </span>
        </h1>
        <p className="mt-3 max-w-[680px] text-[14.5px] leading-relaxed text-[var(--color-ink-2)]">
          以下热点被打上「{topic.name}」标签，按热度从高到低排列，来自全部历史日报。
        </p>
      </section>

      {items.length === 0 ? (
        <div className="glass mt-10 p-10 text-center text-[14px] text-[var(--color-ink-2)]">
          该主题暂无信号，随着每日采集会自动积累。
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Reveal key={`${item.id}-${index}`} delay={(index % 6) * 60}>
              <ItemCard item={item} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

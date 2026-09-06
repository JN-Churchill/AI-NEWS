import Link from "next/link";
import { ArrowRight, Hash } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { getAllIssues } from "@/lib/content";
import { TOPIC_DEFS } from "@/types/schema";

export const metadata = {
  title: "主题",
  description: "按主题标签浏览 AI 日报热点：融资、开源、评测、Agent、多模态、基础设施、安全对齐、具身智能。",
};

export default function TopicsPage() {
  const issues = getAllIssues();
  const allItems = issues.flatMap((issue) => issue.sections.flatMap((section) => section.items));

  const counts = new Map<string, number>();
  for (const item of allItems) {
    for (const topic of item.topics) {
      counts.set(topic, (counts.get(topic) ?? 0) + 1);
    }
  }

  return (
    <div className="pb-4">
      <section className="pt-8">
        <h1 className="text-[clamp(26px,4.4vw,38px)] font-extrabold leading-tight tracking-[-0.02em]">
          主题<span className="gradient-text">浏览</span>
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--color-ink-2)]">
          主题标签横跨五大版块，帮你按关注方向纵向追踪，而不局限于某一天的日报。
        </p>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TOPIC_DEFS.map((topic, index) => {
          const count = counts.get(topic.slug) ?? 0;
          return (
            <Reveal key={topic.slug} delay={index * 50}>
              <Link href={`/topics/${topic.slug}`} className="card h-full p-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-1)] to-[var(--color-brand-3)] text-[#05121a]">
                    <Hash className="h-4 w-4" />
                  </span>
                  <h2 className="text-[16px] font-bold">{topic.name}</h2>
                  <span className="ml-auto chip font-mono">{count} 条</span>
                </div>
                <p className="mt-3.5 text-[13.5px] leading-relaxed text-[var(--color-ink-2)]">
                  {count > 0
                    ? `已收录 ${count} 条与该主题相关的热点信号，点击按热度浏览。`
                    : "暂无该主题的信号，随着每日采集会自动积累。"}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-brand-1)]">
                  浏览 {topic.name}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

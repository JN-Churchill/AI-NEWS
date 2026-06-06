import Link from "next/link";
import { Container } from "@/app/_components/container";
import { PageHero } from "@/app/_components/page-hero";
import { ScoreMeter } from "@/app/_components/score-meter";
import { getAllIssues, getCategoryName } from "@/lib/issues";

export const metadata = {
  title: "主题",
  description: "按模型、产品、论文、开源、商业和基础设施方向浏览 AI 信号指数的主题索引。",
  alternates: {
    canonical: "/topics",
  },
};

export default function TopicsPage() {
  const categories = new Map<string, { count: number; scoreTotal: number }>();

  getAllIssues().forEach((issue) => {
    issue.categories.forEach((category) => {
      const current = categories.get(category.slug) ?? { count: 0, scoreTotal: 0 };
      categories.set(category.slug, {
        count: current.count + category.count,
        scoreTotal: current.scoreTotal + category.score * category.count,
      });
    });
  });

  const topics = Array.from(categories.entries()).map(([slug, value]) => ({
    slug,
    name: getCategoryName(slug),
    count: value.count,
    score: Math.round(value.scoreTotal / Math.max(1, value.count)),
  }));

  return (
    <main>
      <PageHero
        eyebrow="Topics"
        title="主题索引"
        description="按模型、产品、论文、开源和商业方向归档每日信号，方便持续追踪同一类变化。"
        aside={<p className="text-sm leading-6 text-neutral-300">主题页会随着已发布日报自动更新，适合按方向回看趋势和来源变化。</p>}
      />

      <Container className="grid gap-4 py-8 md:grid-cols-2 xl:grid-cols-3">
        {topics.map((topic) => (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            className="editorial-card group rounded-md p-5 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_20px_48px_rgba(38,38,38,0.08)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">{topic.slug}</p>
                <h2 className="mt-2 text-3xl font-semibold text-neutral-950 group-hover:text-emerald-800">{topic.name}</h2>
              </div>
              <span className="rounded-md bg-neutral-950 px-3 py-2 text-xl font-semibold text-white">{topic.count}</span>
            </div>
            <div className="mt-5">
              <ScoreMeter score={topic.score} />
            </div>
            <p className="mt-4 text-sm text-neutral-500">平均热度 {topic.score}，点击查看该主题全部信号。</p>
          </Link>
        ))}
      </Container>
    </main>
  );
}

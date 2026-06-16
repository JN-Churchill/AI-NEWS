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
        aside={
          <p className="text-[14px] leading-[1.65]" style={{ color: "var(--ink-soft)" }}>
            主题页会随着已发布日报自动更新，适合按方向回看趋势和来源变化。
          </p>
        }
      />

      <Container className="grid gap-4 py-8 md:grid-cols-2 xl:grid-cols-3">
        {topics.map((topic) => (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            className="surface-panel card-hover group p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">{topic.slug}</p>
                <h2
                  className="font-editorial mt-2 text-[1.5rem] font-normal leading-[1.15] tracking-[-0.02em] transition-colors"
                  style={{ color: "var(--ink)" }}
                >
                  {topic.name}
                </h2>
              </div>
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg font-mono text-[15px] font-semibold"
                style={{ background: "var(--surface-alt)", color: "var(--ink)" }}
              >
                {topic.count}
              </span>
            </div>
            <div className="mt-5">
              <ScoreMeter score={topic.score} />
            </div>
            <p className="mt-4 font-mono text-[11px] font-medium tracking-[0.04em]" style={{ color: "var(--muted)" }}>
              平均热度 {topic.score}，点击查看该主题全部信号。
            </p>
          </Link>
        ))}
      </Container>
    </main>
  );
}

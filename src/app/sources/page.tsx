import Link from "next/link";
import { Container } from "@/app/_components/container";
import { PageHero } from "@/app/_components/page-hero";
import { getAllSources, getEnabledSources } from "@/lib/sources";
import { getCategoryName } from "@/lib/issues";

export const metadata = {
  title: "来源",
  description: "查看 AI 信号指数用于采集和复核的公开来源池、来源类型、解析方式和权重。",
  alternates: {
    canonical: "/sources",
  },
};

export default function SourcesPage() {
  const sources = getAllSources();
  const enabledSources = getEnabledSources();

  return (
    <main>
      <PageHero
        eyebrow="Sources"
        title="来源池"
        description="这里列出当前采集和复核使用的公开来源。来源权重只影响候选排序，不替代人工判断。"
        aside={
          <p className="text-[14px] leading-[1.65]" style={{ color: "var(--ink-soft)" }}>
            当前启用 {enabledSources.length} / {sources.length} 个来源，覆盖官方、论文、社区和媒体。
          </p>
        }
      />

      <Container className="grid gap-4 py-8 md:grid-cols-2 xl:grid-cols-3">
        {sources.map((source) => (
          <article
            key={source.id}
            className={`surface-panel card-hover p-5 ${
              source.enabled ? "" : "opacity-70"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">
                  {source.type} · {source.fetchMode}
                </p>
                <h2
                  className="font-editorial mt-2 text-[1.35rem] font-normal leading-[1.2] tracking-[-0.02em]"
                  style={{ color: "var(--ink)" }}
                >
                  {source.name}
                </h2>
              </div>
              <span
                className="rounded-md px-2.5 py-1 font-mono text-[13px] font-semibold"
                style={{
                  background: source.enabled ? "var(--pastel-blue)" : "var(--surface-alt)",
                  color: source.enabled ? "var(--pastel-blue-text)" : "var(--muted)",
                }}
              >
                {source.enabled ? source.trustScore : "待接入"}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg p-3" style={{ background: "var(--surface-alt)", border: "1px solid var(--line)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--muted)" }}>默认分类</p>
                <p className="mt-1 text-[13px] font-semibold" style={{ color: "var(--ink)" }}>{getCategoryName(source.category)}</p>
              </div>
              <div className="rounded-lg p-3" style={{ background: "var(--surface-alt)", border: "1px solid var(--line)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--muted)" }}>解析器</p>
                <p className="mt-1 text-[13px] font-semibold" style={{ color: "var(--ink)" }}>{source.parser}</p>
              </div>
            </div>
            <p className="mt-4 min-h-12 text-[14px] font-medium leading-[1.65]" style={{ color: "var(--ink-soft)" }}>
              {source.notes}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary h-9"
              >
                打开来源
              </Link>
              {source.feedUrl ? (
                <Link
                  href={source.feedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary h-9"
                >
                  Feed
                </Link>
              ) : null}
              {source.requiresAuth ? (
                <span
                  className="inline-flex h-9 items-center rounded-md px-3 font-mono text-[11px] font-semibold"
                  style={{ background: "var(--surface-alt)", border: "1px solid var(--line)", color: "var(--muted)" }}
                >
                  {source.authEnv || "需授权"}
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </Container>
    </main>
  );
}

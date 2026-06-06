import Link from "next/link";
import { Container } from "@/app/_components/container";
import { PageHero } from "@/app/_components/page-hero";
import { getAllSources, getEnabledSources } from "@/lib/sources";
import { getCategoryName } from "@/lib/issues";

export const metadata = {
  title: "来源",
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
        aside={<p className="text-sm leading-6 text-neutral-300">当前启用 {enabledSources.length} / {sources.length} 个来源，覆盖官方、论文、社区和媒体。</p>}
      />

      <Container className="grid gap-4 py-8 md:grid-cols-2 xl:grid-cols-3">
        {sources.map((source) => (
          <article
            key={source.id}
            className={`editorial-card rounded-md p-5 transition hover:-translate-y-0.5 hover:border-neutral-300 ${
              source.enabled ? "" : "opacity-75"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
                  {source.type} · {source.fetchMode}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">{source.name}</h2>
              </div>
              <span className={`rounded-md px-2.5 py-1 text-sm font-semibold ${source.enabled ? "bg-emerald-700 text-white" : "bg-neutral-100 text-neutral-500"}`}>
                {source.enabled ? source.trustScore : "待接入"}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md border border-neutral-200 bg-neutral-50/80 p-3">
                <p className="text-neutral-500">默认分类</p>
                <p className="mt-1 font-semibold text-neutral-950">{getCategoryName(source.category)}</p>
              </div>
              <div className="rounded-md border border-neutral-200 bg-neutral-50/80 p-3">
                <p className="text-neutral-500">解析器</p>
                <p className="mt-1 font-semibold text-neutral-950">{source.parser}</p>
              </div>
            </div>
            <p className="mt-4 min-h-12 text-sm leading-6 text-neutral-600">{source.notes}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center rounded-md border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50"
              >
                打开来源
              </Link>
              {source.feedUrl ? (
                <Link
                  href={source.feedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center rounded-md bg-neutral-950 px-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  Feed
                </Link>
              ) : null}
              {source.requiresAuth ? (
                <span className="inline-flex h-9 items-center rounded-md border border-amber-200 bg-amber-50 px-3 text-sm font-semibold text-amber-900">
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

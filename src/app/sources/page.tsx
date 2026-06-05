import Link from "next/link";
import { Container } from "@/app/_components/container";
import { PageHero } from "@/app/_components/page-hero";
import { getEnabledSources } from "@/lib/sources";
import { getCategoryName } from "@/lib/issues";

export const metadata = {
  title: "来源",
};

export default function SourcesPage() {
  const sources = getEnabledSources();

  return (
    <main>
      <PageHero
        eyebrow="Sources"
        title="来源池"
        description="这里列出当前采集和复核使用的公开来源。来源权重只影响候选排序，不替代人工判断。"
        aside={<p className="text-sm leading-6 text-neutral-300">当前启用 {sources.length} 个来源，覆盖官方、论文、社区和媒体。</p>}
      />

      <Container className="grid gap-4 py-6 md:grid-cols-2 xl:grid-cols-3">
        {sources.map((source) => (
          <article key={source.id} className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">{source.type}</p>
                <h2 className="mt-2 text-xl font-semibold text-neutral-950">{source.name}</h2>
              </div>
              <span className="rounded-md bg-neutral-950 px-2.5 py-1 text-sm font-semibold text-white">{source.trustScore}</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-neutral-600">默认分类：{getCategoryName(source.category)}</p>
            <Link
              href={source.url}
              target="_blank"
              className="mt-5 inline-flex h-9 items-center rounded-md border border-neutral-200 px-3 text-sm font-semibold text-neutral-700 hover:border-neutral-400"
            >
              打开来源
            </Link>
          </article>
        ))}
      </Container>
    </main>
  );
}

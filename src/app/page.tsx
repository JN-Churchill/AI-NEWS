import Link from "next/link";
import { CategoryFilter } from "@/app/_components/category-filter";
import { Container } from "@/app/_components/container";
import { IssuePanel } from "@/app/_components/issue-panel";
import { SidebarPanel } from "@/app/_components/sidebar-panel";
import { SignalCard } from "@/app/_components/signal-card";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import { getFilteredItems, getLatestIssue, getTopTags } from "@/lib/issues";

type HomeProps = {
  searchParams: Promise<{
    category?: string;
    tag?: string;
  }>;
};

function parseCategories(value?: string) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default async function Index({ searchParams }: HomeProps) {
  const params = await searchParams;
  const issue = getLatestIssue();

  if (!issue) {
    return (
      <main>
        <Container className="py-16">
          <h1 className="text-3xl font-semibold text-neutral-950">暂无日报</h1>
        </Container>
      </main>
    );
  }

  const activeCategories = parseCategories(params.category);
  const activeTag = params.tag?.trim();
  const items = getFilteredItems(issue, activeCategories, activeTag);
  const topTags = getTopTags(issue.items);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(jsonLd) }} />
      <IssuePanel issue={issue} />

      <Container className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_330px]">
        <section className="min-w-0">
          <div className="mb-5 overflow-hidden rounded-md border border-neutral-200 bg-white/85 shadow-sm">
            <div className="fine-rule h-px w-full" />
            <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">Selected Signals</p>
                  <span className="rounded bg-neutral-100 px-2 py-1 text-[11px] font-semibold text-neutral-500">
                    {items.length}/{issue.candidateCount}
                  </span>
                  {activeCategories.length > 0 ? (
                    <span className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800">
                      {activeCategories.length} 个分类
                    </span>
                  ) : null}
                  {activeTag ? (
                    <span className="rounded bg-neutral-950 px-2 py-1 text-[11px] font-semibold text-white">#{activeTag}</span>
                  ) : null}
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">今日入选信号</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">
                  从候选池、来源可信度和主题价值里筛出今日队列，优先呈现对产品、研发和商业判断有影响的变化。
                </p>
                {activeCategories.length > 0 || activeTag ? (
                  <Link
                    href="/"
                    className="mt-3 inline-flex text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
                  >
                    清除筛选
                  </Link>
                ) : null}
              </div>
              <form action="/search" className="flex min-w-0 gap-2">
                <label htmlFor="home-search" className="sr-only">
                  搜索信号
                </label>
                <input
                  id="home-search"
                  className="h-10 min-w-0 flex-1 rounded-md border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-neutral-950"
                  name="q"
                  placeholder="Agent / 模型 / 开源"
                />
                <button className="h-10 shrink-0 rounded-md bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800" type="submit">
                  搜索
                </button>
              </form>
            </div>
          </div>

          <CategoryFilter categories={issue.categories} activeCategories={activeCategories} activeTag={activeTag} />
          <div className="mt-4 flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <Link
                key={tag}
                href={`/?tag=${encodeURIComponent(tag)}`}
                className="rounded-md border border-neutral-200 bg-white/70 px-2.5 py-1 text-xs font-semibold text-neutral-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
              >
                {tag} · {count}
              </Link>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            {items.length === 0 ? (
              <div className="rounded-md border border-dashed border-neutral-300 bg-white/70 p-10 text-center text-sm text-neutral-500">
                该分类暂无信号，换一个主题看看。
              </div>
            ) : (
              items.map((item) => (
                <SignalCard key={item.rank} item={item} issueDate={issue.date} />
              ))
            )}
          </div>
        </section>

        <SidebarPanel issue={issue} />
      </Container>
    </main>
  );
}

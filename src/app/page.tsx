import Link from "next/link";
import { CategoryFilter } from "@/app/_components/category-filter";
import { Container } from "@/app/_components/container";
import { IssuePanel } from "@/app/_components/issue-panel";
import { MethodCard } from "@/app/_components/method-card";
import { ScoreMeter } from "@/app/_components/score-meter";
import { SignalCard } from "@/app/_components/signal-card";
import { getFilteredItems, getLatestIssue, getTopTags } from "@/lib/issues";
import { getEnabledSources } from "@/lib/sources";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";

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
  const sources = getEnabledSources();

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
  const selectedSourceCount = new Set(issue.items.map((item) => item.source)).size;
  const homeJsonLd = {
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(homeJsonLd) }} />
      <IssuePanel issue={issue} />

      <Container className="grid gap-6 py-6 lg:grid-cols-[260px_1fr_320px]">
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <section className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Desk</p>
            <div className="mt-4 space-y-2">
              {[
                ["/", "今日精选", String(issue.selectedCount)],
                ["/topics", "主题索引", String(issue.categories.length)],
                ["/sources", "来源池", String(sources.length)],
                ["/archive", "历史归档", issue.issueNo],
              ].map(([href, label, meta]) => (
                <Link
                  key={href}
                  className={`flex h-10 items-center justify-between rounded-md px-3 text-sm font-semibold transition ${
                    href === "/"
                      ? "bg-neutral-950 text-white"
                      : "border border-neutral-200 text-neutral-700 hover:border-neutral-400"
                  }`}
                  href={href}
                >
                  {label}
                  <span>{meta}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Search</p>
            <form className="mt-4" action="/search">
              <input
                className="h-10 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none focus:border-neutral-950"
                name="q"
                placeholder="Agent / RAG / 开源"
              />
            </form>
          </section>

          <section className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Tags</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {topTags.map(([tag, count]) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:border-neutral-400"
                >
                  {tag} · {count}
                </Link>
              ))}
            </div>
          </section>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Selected Signals</p>
              <h2 className="mt-2 text-2xl font-semibold text-neutral-950">今日入选信号</h2>
            </div>
            <p className="text-sm text-neutral-500">
              从 {issue.candidateCount} 条候选中筛出 {items.length} 条
              {activeTag ? ` · 标签 ${activeTag}` : ""}
            </p>
          </div>
          <CategoryFilter categories={issue.categories} activeCategories={activeCategories} activeTag={activeTag} />
          {activeTag ? (
            <div className="mt-3 flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              <span>正在查看标签：{activeTag}</span>
              <Link href={activeCategories.length > 0 ? `/?category=${activeCategories.join(",")}` : "/"} className="font-semibold">
                清除
              </Link>
            </div>
          ) : null}
          <div className="mt-5 space-y-4">
            {items.map((item) => (
              <SignalCard key={item.rank} item={item} issueDate={issue.date} />
            ))}
          </div>
          {items.length === 0 ? (
            <div className="mt-5 rounded-md border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
              当前筛选条件下暂无信号，换一个分类或标签试试。
            </div>
          ) : null}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <section className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Pulse</p>
                <h2 className="mt-2 text-base font-semibold text-neutral-950">分类热度</h2>
              </div>
              <Link href={`/daily/${issue.date}`} className="text-sm font-semibold text-neutral-700 hover:text-neutral-950">
                详情
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              {issue.categories.map((category) => (
                <Link key={category.slug} href={`/?category=${category.slug}`} className="block">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-neutral-800">{category.name}</span>
                    <span className="text-neutral-500">{category.score}</span>
                  </div>
                  <ScoreMeter score={category.score} />
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-neutral-900 bg-neutral-950 p-5 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Source Mix</p>
            <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 text-sm">
              <div className="bg-neutral-950 p-3">
                <p className="text-neutral-400">入选来源</p>
                <p className="mt-1 text-2xl font-semibold">{selectedSourceCount}</p>
              </div>
              <div className="bg-neutral-950 p-3">
                <p className="text-neutral-400">来源池</p>
                <p className="mt-1 text-2xl font-semibold">{sources.length}</p>
              </div>
            </div>
            <Link
              href="/sources"
              className="mt-4 flex h-9 items-center justify-center rounded-md border border-white/15 text-sm font-semibold text-neutral-200 hover:border-white/35"
            >
              查看来源
            </Link>
          </section>

          <section className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Newsletter</p>
            <h2 className="mt-3 text-lg font-semibold text-neutral-950">每日邮件预留位</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">后续接入邮件服务后，这里可以转为订阅入口。</p>
          </section>

          <section className="space-y-3">
            <MethodCard
              label="可操作性"
              value={30}
              description="内容能否直接影响选型、产品判断、研发投入或业务动作。"
            />
            <MethodCard
              label="行业影响"
              value={20}
              description="信号是否可能改变竞争格局、生态路线或用户预期。"
            />
          </section>
        </aside>
      </Container>
    </main>
  );
}

import Link from "next/link";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import { getFilteredItems, getLatestIssue, getTopTags } from "@/lib/issues";
import { getLatestAihot } from "@/lib/aihot";
import { formatAihotDateTitle } from "@/lib/aihot-format";
import { defaultLocale, type Locale } from "@/i18n/config";
import { HomeClient } from "@/app/_components/home-client";

type HomeProps = {
  searchParams: Promise<{
    category?: string;
    tag?: string;
  }>;
  params: Promise<{
    locale?: Locale;
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

export default async function Index({ searchParams, params: paramsPromise }: HomeProps) {
  const params = await searchParams;
  const { locale = defaultLocale } = await paramsPromise;
  const issue = getLatestIssue();

  if (!issue) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <section className="surface-panel max-w-3xl p-8">
          <p className="section-kicker">Daily Intelligence Brief</p>
          <h1 className="mt-4 text-2xl font-bold text-neutral-900">暂无日报内容</h1>
          <p className="mt-3 text-sm text-neutral-600">
            当前还没有可发布的日报 JSON。生成并发布第一期后，首页会自动展示今日信号、主题筛选、订阅入口和历史归档。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/sources" className="btn-primary">
              查看来源池
            </Link>
            <Link href="/about" className="btn-secondary">
              查看评分方法
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const activeCategories = parseCategories(params.category);
  const activeTag = params.tag?.trim();
  const items = getFilteredItems(issue, activeCategories, activeTag);
  const topTags = getTopTags(issue.items);
  const hasFilters = activeCategories.length > 0 || Boolean(activeTag);
  const latestAihot = getLatestAihot();
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
      <HomeClient
        locale={locale}
        issue={issue}
        items={items}
        topTags={topTags}
        activeCategories={activeCategories}
        activeTag={activeTag}
        hasFilters={hasFilters}
      />

      {latestAihot ? (
        <section className="mx-auto max-w-[960px] px-5 pb-14 sm:px-6">
          <div className="editorial-card card-hover p-6 sm:p-7">
            <p className="section-kicker">AI HOT 日报</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <h2 className="editorial-title text-xl font-bold">AI 晨报看板</h2>
                <p className="mt-1.5 text-[13px]" style={{ color: "var(--muted)" }}>
                  最新一期 {formatAihotDateTitle(latestAihot.date)}　·　共 {latestAihot.itemCount} 条　·　五色版块速览模型、产品、行业、论文与观点动态。
                </p>
              </div>
              <Link href={`/briefing/${latestAihot.date}`} className="btn-primary shrink-0">
                查看看板
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

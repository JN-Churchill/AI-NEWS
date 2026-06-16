import Link from "next/link";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import { getFilteredItems, getLatestIssue, getTopTags } from "@/lib/issues";
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
    </main>
  );
}

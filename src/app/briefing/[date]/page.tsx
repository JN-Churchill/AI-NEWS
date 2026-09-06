import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AihotBriefing } from "@/app/_components/aihot-briefing";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getAihotByDate, getAihotDates } from "@/lib/aihot";
import { formatAihotDateTitle } from "@/lib/aihot-format";

type BriefingPageProps = {
  params: Promise<{
    date: string;
  }>;
};

// 数据完全来自本地 content/aihot（构建期已枚举全部日期），
// 新日期只随重新构建出现，因此未知日期直接以 404 状态响应，而不是按需渲染。
export const dynamicParams = false;

function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default async function BriefingPage({ params }: BriefingPageProps) {
  const { date } = await params;
  const daily = getAihotByDate(date);

  if (!daily) {
    notFound();
  }

  const pageUrl = `${SITE_URL}/briefing/${daily.date}`;
  const flatItems = daily.sections.flatMap((section) => section.items);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `AI 晨报 · ${formatAihotDateTitle(daily.date)}`,
    description: `AI HOT 日报看板（${daily.date}），共 ${daily.itemCount} 条。`,
    datePublished: `${daily.date}T08:00:00+08:00`,
    inLanguage: "zh-CN",
    mainEntityOfPage: pageUrl,
    isBasedOn: daily.sourceUrl,
    hasPart: flatItems.map((item, index) => ({
      "@type": "NewsArticle",
      headline: item.title,
      description: item.summary || undefined,
      url: `${pageUrl}#aihot-${index + 1}`,
      position: index + 1,
      datePublished: item.publishedAt,
      isBasedOn: item.originalUrl || undefined,
    })),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(jsonLd) }} />
      <AihotBriefing daily={daily} />
    </main>
  );
}

export async function generateMetadata({ params }: BriefingPageProps): Promise<Metadata> {
  const { date } = await params;
  const daily = getAihotByDate(date);

  if (!daily) {
    return {};
  }

  const title = `AI 晨报 · ${formatAihotDateTitle(daily.date)}`;
  const description = `AI HOT 日报看板（${daily.date}），共 ${daily.itemCount} 条：模型、产品、行业、论文与技巧观点五版块速览。`;
  const url = `${SITE_URL}/briefing/${daily.date}`;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
}

export function generateStaticParams() {
  return getAihotDates().map((date) => ({ date }));
}

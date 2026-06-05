import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/app/_components/container";
import { EntryListCard } from "@/app/_components/entry-list-card";
import { PageHero } from "@/app/_components/page-hero";
import { getAllTopicSlugs, getTopicEntries } from "@/lib/catalog";
import { SITE_NAME } from "@/lib/constants";
import { getCategoryName } from "@/lib/issues";

type TopicPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const entries = getTopicEntries(slug);

  if (entries.length === 0) {
    notFound();
  }

  const title = `${getCategoryName(slug)}信号`;

  return (
    <main>
      <PageHero
        eyebrow="Topic"
        title={title}
        description={`这里汇总所有归入「${getCategoryName(slug)}」方向的日报信号，用于观察长期趋势和重点来源。`}
        aside={<p className="text-sm leading-6 text-neutral-300">共 {entries.length} 条信号，按日报时间和原始排序展示。</p>}
      />
      <Container className="grid gap-4 py-6 lg:grid-cols-2">
        {entries.map((item) => (
          <EntryListCard key={`${item.issueDate}-${item.rank}`} item={item} />
        ))}
      </Container>
    </main>
  );
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const name = getCategoryName(slug);

  return {
    title: `${name}信号`,
    description: `${SITE_NAME} 中归入 ${name} 方向的 AI 新闻和行业信号。`,
  };
}

export function generateStaticParams() {
  return getAllTopicSlugs().map((slug) => ({ slug }));
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/app/_components/container";
import { IssuePanel } from "@/app/_components/issue-panel";
import { ScoreMeter } from "@/app/_components/score-meter";
import { SignalCard } from "@/app/_components/signal-card";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getAllIssues, getIssueByDate } from "@/lib/issues";

type DailyPageProps = {
  params: Promise<{
    date: string;
  }>;
};

const metricLabels = [
  ["utility", "实用"],
  ["novelty", "增量"],
  ["impact", "影响"],
  ["credibility", "可信"],
  ["audience", "契合"],
  ["freshness", "新鲜"],
] as const;

function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default async function DailyPage({ params }: DailyPageProps) {
  const { date } = await params;
  const issue = getIssueByDate(date);

  if (!issue || issue.status !== "published") {
    notFound();
  }

  const issueUrl = `${SITE_URL}/daily/${issue.date}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: `${issue.date} ${issue.title}`,
    description: issue.summary,
    datePublished: new Date(`${issue.date}T08:00:00+08:00`).toISOString(),
    dateModified: new Date(`${issue.date}T08:00:00+08:00`).toISOString(),
    inLanguage: "zh-CN",
    mainEntityOfPage: issueUrl,
    articleSection: issue.categories.map((category) => category.name),
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    hasPart: issue.items.map((item) => ({
      "@type": "NewsArticle",
      headline: item.title,
      description: item.summary,
      url: `${issueUrl}#signal-${item.rank}`,
      datePublished: item.publishedAt,
      isBasedOn: item.sourceUrl || undefined,
      position: item.rank,
      keywords: item.tags.join(", "),
    })),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(jsonLd) }} />
      <IssuePanel issue={issue} />
      <Container className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_330px]">
        <section className="min-w-0 space-y-4">
          {issue.items.map((item) => (
            <SignalCard key={item.rank} item={item} issueDate={issue.date} variant="detailed" />
          ))}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="editorial-card rounded-md p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">Score Board</p>
            <h2 className="mt-2 text-lg font-semibold text-neutral-950">入选排行</h2>
            <div className="mt-5 space-y-4">
              {issue.items.map((item) => (
                <a key={item.rank} href={`#signal-${item.rank}`} className="group block rounded-md p-1 transition hover:bg-neutral-50">
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-semibold text-neutral-800 group-hover:text-emerald-800">
                      #{item.rank} {item.title}
                    </span>
                    <span className="shrink-0 text-neutral-500">{item.score}</span>
                  </div>
                  <ScoreMeter score={item.score} />
                </a>
              ))}
            </div>
          </section>

          <section className="editorial-card rounded-md p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">Metric Average</p>
            <h2 className="mt-2 text-lg font-semibold text-neutral-950">维度均值</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {metricLabels.map(([key, label]) => {
                const average = Math.round(
                  issue.items.reduce((sum, item) => sum + item.metrics[key], 0) / issue.items.length,
                );

                return (
                  <div key={key} className="rounded-md border border-neutral-200 bg-white/80 p-3">
                    <p className="text-xs font-semibold text-neutral-400">{label}</p>
                    <p className="mt-1 text-2xl font-semibold text-neutral-950">{average}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </Container>
    </main>
  );
}

export async function generateMetadata({ params }: DailyPageProps): Promise<Metadata> {
  const { date } = await params;
  const issue = getIssueByDate(date);

  if (!issue || issue.status !== "published") {
    return {};
  }

  const url = `${SITE_URL}/daily/${issue.date}`;
  const imageUrl = `/daily/${issue.date}/opengraph-image`;

  return {
    title: `${date} ${issue.title}`,
    description: issue.summary,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${date} ${issue.title} | ${SITE_NAME}`,
      description: issue.summary,
      url,
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${date} ${issue.title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${date} ${issue.title} | ${SITE_NAME}`,
      description: issue.summary,
      images: [imageUrl],
    },
  };
}

export function generateStaticParams() {
  return getAllIssues().map((issue) => ({
    date: issue.date,
  }));
}

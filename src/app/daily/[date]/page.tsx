import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IssuePanel } from "@/app/_components/issue-panel";
import { SignalCard } from "@/app/_components/signal-card";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getAllIssues, getIssueByDate } from "@/lib/issues";

type DailyPageProps = {
  params: Promise<{
    date: string;
  }>;
};

const metricLabels = [
  ["utility", "Utility"],
  ["novelty", "Novelty"],
  ["impact", "Impact"],
  ["credibility", "Credibility"],
  ["audience", "Audience"],
  ["freshness", "Freshness"],
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
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
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

      <div className="mx-auto max-w-[1200px] px-5 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="min-w-0 space-y-3">
            {issue.items.map((item) => (
              <SignalCard key={item.rank} item={item} issueDate={issue.date} variant="detailed" />
            ))}
          </section>

          <aside className="space-y-4 lg:sticky lg:top-[68px] lg:self-start">
            {/* Rankings */}
            <section className="surface-panel p-5">
              <p className="section-kicker">Rankings</p>
              <div className="mt-3 space-y-0.5">
                {issue.items.map((item) => (
                  <a
                    key={item.rank}
                    href={`#signal-${item.rank}`}
                    className="group flex items-center justify-between rounded-lg px-2 py-2 hover-bg"
                  >
                    <span className="min-w-0 truncate text-[13px] font-medium" style={{ color: "var(--ink-soft)" }}>
                      <span className="mr-1.5 font-mono text-[11px]" style={{ color: "var(--muted)" }}>#{item.rank}</span>
                      {item.title}
                    </span>
                    <span className="ml-3 shrink-0 font-mono text-[12px] font-semibold" style={{ color: "var(--muted)" }}>
                      {item.score}
                    </span>
                  </a>
                ))}
              </div>
            </section>

            {/* Metric averages */}
            <section className="surface-panel p-5">
              <p className="section-kicker">Averages</p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {metricLabels.map(([key, label]) => {
                  const average = Math.round(
                    issue.items.reduce((sum, item) => sum + item.metrics[key], 0) / issue.items.length,
                  );
                  return (
                    <div key={key} className="text-center">
                      <p className="text-[17px] font-semibold" style={{ color: "var(--ink)" }}>{average}</p>
                      <p className="text-[10px] font-medium" style={{ color: "var(--muted)" }}>{label}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>
      </div>
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
    alternates: { canonical: url },
    openGraph: {
      title: `${date} ${issue.title} | ${SITE_NAME}`,
      description: issue.summary,
      url,
      type: "article",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${date} ${issue.title}` }],
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
  return getAllIssues().map((issue) => ({ date: issue.date }));
}

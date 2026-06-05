import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/app/_components/container";
import { IssuePanel } from "@/app/_components/issue-panel";
import { ScoreMeter } from "@/app/_components/score-meter";
import { SignalCard } from "@/app/_components/signal-card";
import { SITE_NAME } from "@/lib/constants";
import { getAllIssues, getIssueByDate } from "@/lib/issues";

type DailyPageProps = {
  params: Promise<{
    date: string;
  }>;
};

const metricLabels = [
  ["utility", "可操作"],
  ["novelty", "增量"],
  ["impact", "影响"],
  ["credibility", "可信"],
  ["audience", "契合"],
  ["freshness", "新鲜"],
] as const;

export default async function DailyPage({ params }: DailyPageProps) {
  const { date } = await params;
  const issue = getIssueByDate(date);

  if (!issue) {
    notFound();
  }

  return (
    <main>
      <IssuePanel issue={issue} />
      <Container className="grid gap-6 py-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          {issue.items.map((item) => (
            <SignalCard key={item.rank} item={item} />
          ))}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <section className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Score Board</p>
            <h2 className="mt-2 text-lg font-semibold text-neutral-950">入选排行</h2>
            <div className="mt-5 space-y-4">
              {issue.items.map((item) => (
                <div key={item.rank}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-semibold text-neutral-800">
                      #{item.rank} {item.title}
                    </span>
                    <span className="text-neutral-500">{item.score}</span>
                  </div>
                  <ScoreMeter score={item.score} />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Metric Average</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {metricLabels.map(([key, label]) => {
                const average = Math.round(
                  issue.items.reduce((sum, item) => sum + item.metrics[key], 0) / issue.items.length,
                );

                return (
                  <div key={key} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                    <p className="text-sm font-semibold text-neutral-950">{label}</p>
                    <p className="mt-2 text-2xl font-semibold text-neutral-950">{average}</p>
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

  if (!issue) {
    return {};
  }

  return {
    title: `${date} ${issue.title}`,
    description: issue.summary,
    openGraph: {
      title: `${date} ${issue.title} | ${SITE_NAME}`,
      description: issue.summary,
    },
  };
}

export function generateStaticParams() {
  return getAllIssues().map((issue) => ({
    date: issue.date,
  }));
}

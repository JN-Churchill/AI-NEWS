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
      <Container className="grid gap-8 py-8 lg:grid-cols-[1fr_300px]">
        {/* Main content – detailed cards */}
        <section className="min-w-0">
          {issue.items.map((item) => (
            <SignalCard key={item.rank} item={item} variant="detailed" />
          ))}
        </section>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          {/* Score Board */}
          <section className="border-b border-neutral-200 pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Score Board
            </p>
            <p className="mt-2 text-sm font-medium text-neutral-600">入选排行</p>
            <div className="mt-4 space-y-3">
              {issue.items.map((item) => (
                <div key={item.rank}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                    <span className="truncate font-medium text-neutral-700">
                      <span className="mr-1.5 text-neutral-400">#{item.rank}</span>
                      {item.title}
                    </span>
                    <span className="shrink-0 font-semibold text-neutral-950">{item.score}</span>
                  </div>
                  <ScoreMeter score={item.score} />
                </div>
              ))}
            </div>
          </section>

          {/* Metric Average */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Metric Average
            </p>
            <p className="mt-2 text-sm font-medium text-neutral-600">维度均值</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {metricLabels.map(([key, label]) => {
                const average = Math.round(
                  issue.items.reduce((sum, item) => sum + item.metrics[key], 0) / issue.items.length,
                );

                return (
                  <div key={key} className="rounded-md border border-neutral-200 bg-white p-3">
                    <p className="text-xs text-neutral-400">{label}</p>
                    <p className="mt-1 text-xl font-semibold text-neutral-950">{average}</p>
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

import Link from "next/link";
import { Container } from "@/app/_components/container";
import { ScoreMeter } from "@/app/_components/score-meter";
import { getAllIssues } from "@/lib/issues";

export const metadata = {
  title: "历史归档",
};

export default function ArchivePage() {
  const issues = getAllIssues();

  return (
    <main>
      <section className="border-b border-neutral-900 bg-neutral-950 text-white">
        <Container className="py-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">Archive</p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold leading-tight">历史归档</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-300">
                每一期日报都是一个可回溯的 AI 行业快照，后续可以按月份、主题和来源继续扩展。
              </p>
            </div>
            <div className="border-l border-white/15 pl-5">
              <p className="text-sm text-neutral-300">已收录期数</p>
              <p className="mt-1 text-4xl font-semibold">{issues.length}</p>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {issues.map((issue) => (
            <Link
              key={issue.date}
              href={`/daily/${issue.date}`}
              className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-400 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-500">{issue.date}</p>
                  <h2 className="mt-2 text-xl font-semibold text-neutral-950">{issue.title}</h2>
                </div>
                <span className="rounded-md bg-neutral-950 px-3 py-2 text-2xl font-semibold text-white">
                  {issue.totalScore}
                </span>
              </div>
              <p className="mt-4 min-h-12 text-sm leading-6 text-neutral-600">{issue.summary}</p>
              <div className="mt-5">
                <ScoreMeter score={issue.totalScore} />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-md bg-neutral-50 p-3">
                  <p className="text-neutral-500">候选</p>
                  <p className="mt-1 font-semibold text-neutral-950">{issue.candidateCount}</p>
                </div>
                <div className="rounded-md bg-neutral-50 p-3">
                  <p className="text-neutral-500">入选</p>
                  <p className="mt-1 font-semibold text-neutral-950">{issue.selectedCount}</p>
                </div>
                <div className="rounded-md bg-neutral-50 p-3">
                  <p className="text-neutral-500">阅读</p>
                  <p className="mt-1 font-semibold text-neutral-950">{issue.readingMinutes}m</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </main>
  );
}

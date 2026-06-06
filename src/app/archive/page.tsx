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
      {/* Header */}
      <section className="border-b border-neutral-200 bg-white">
        <Container className="py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
            Archive
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold leading-tight text-neutral-950">
                历史归档
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-6 text-neutral-500">
                每一期日报都是一个可回溯的 AI 行业快照，可按日期浏览长期沉淀的每日信号。
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-400">已收录期数</p>
              <p className="mt-1 text-3xl font-semibold text-neutral-950">{issues.length}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Issue cards */}
      <Container className="py-8">
        {issues.length === 0 ? (
          <p className="py-12 text-center text-sm text-neutral-400">暂无归档</p>
        ) : (
          <div className="divide-y divide-neutral-200">
            {issues.map((issue) => (
              <Link
                key={issue.date}
                href={`/daily/${issue.date}`}
                className="group flex items-start justify-between gap-6 py-5 transition hover:bg-neutral-50 -mx-4 px-4 rounded"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-neutral-400">{issue.date}</p>
                  <h2 className="mt-1.5 text-lg font-semibold text-neutral-950 group-hover:text-neutral-600 transition">
                    {issue.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-neutral-500 line-clamp-2">
                    {issue.summary}
                  </p>
                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {issue.categories.map((cat) => (
                      <span
                        key={cat.slug}
                        className="rounded-sm bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Score + stats */}
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-semibold text-neutral-950">{issue.totalScore}</p>
                  <div className="mt-2 w-20">
                    <ScoreMeter score={issue.totalScore} />
                  </div>
                  <div className="mt-3 flex gap-3 text-xs text-neutral-400">
                    <span>
                      <span className="font-medium text-neutral-600">{issue.candidateCount}</span> 候选
                    </span>
                    <span>
                      <span className="font-medium text-neutral-600">{issue.selectedCount}</span> 入选
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}

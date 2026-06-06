import Link from "next/link";
import { Container } from "@/app/_components/container";
import { PageHero } from "@/app/_components/page-hero";
import { ScoreMeter } from "@/app/_components/score-meter";
import { getAllIssues } from "@/lib/issues";
import { paginateItems } from "@/lib/pagination";

export const metadata = {
  title: "历史归档",
  description: "浏览 AI 信号指数已发布的每日 AI 行业信号和历史快照。",
  alternates: {
    canonical: "/archive",
  },
};

type ArchivePageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

const pageSize = 12;

function getArchivePageHref(page: number) {
  return page <= 1 ? "/archive" : `/archive?page=${page}`;
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const params = await searchParams;
  const issues = getAllIssues();
  const pagination = paginateItems(issues, params.page, pageSize);

  return (
    <main>
      <PageHero
        eyebrow="Archive"
        title="历史归档"
        description="每一期日报都是一个可回溯的 AI 行业快照，可按日期浏览长期沉淀的每日信号。"
        aside={
          <div>
            <p className="text-sm text-neutral-400">已收录期数</p>
            <p className="mt-2 text-5xl font-semibold leading-none text-white">{issues.length}</p>
          </div>
        }
      />

      <Container className="py-8">
        {issues.length === 0 ? (
          <div className="rounded-md border border-dashed border-neutral-300 bg-white/70 p-10 text-center text-sm text-neutral-500">
            暂无归档
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-col gap-3 rounded-md border border-neutral-200 bg-white/75 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-neutral-500">
                第 {pagination.currentPage} / {pagination.pageCount} 页，每页最多 {pagination.pageSize} 期
              </p>
              <div className="flex gap-2">
                <Link
                  href={pagination.hasPreviousPage ? getArchivePageHref(pagination.currentPage - 1) : getArchivePageHref(pagination.currentPage)}
                  aria-disabled={!pagination.hasPreviousPage}
                  tabIndex={pagination.hasPreviousPage ? undefined : -1}
                  className={`flex h-9 items-center rounded-md border px-3 text-sm font-semibold ${
                    !pagination.hasPreviousPage
                      ? "pointer-events-none border-neutral-200 text-neutral-300"
                      : "border-neutral-200 bg-white text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50"
                  }`}
                >
                  上一页
                </Link>
                <Link
                  href={pagination.hasNextPage ? getArchivePageHref(pagination.currentPage + 1) : getArchivePageHref(pagination.currentPage)}
                  aria-disabled={!pagination.hasNextPage}
                  tabIndex={pagination.hasNextPage ? undefined : -1}
                  className={`flex h-9 items-center rounded-md border px-3 text-sm font-semibold ${
                    !pagination.hasNextPage
                      ? "pointer-events-none border-neutral-200 text-neutral-300"
                      : "border-neutral-200 bg-white text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50"
                  }`}
                >
                  下一页
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              {pagination.items.map((issue) => (
                <Link
                  key={issue.date}
                  href={`/daily/${issue.date}`}
                  className="editorial-card group grid gap-4 rounded-md p-5 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_20px_48px_rgba(38,38,38,0.08)] md:grid-cols-[150px_minmax(0,1fr)_160px]"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">Issue</p>
                    <p className="mt-2 text-xl font-semibold text-neutral-950">{issue.date}</p>
                    <p className="mt-1 text-xs text-neutral-400">第 {issue.issueNo} 期</p>
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 group-hover:text-emerald-800">
                      {issue.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">{issue.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {issue.categories.map((cat) => (
                        <span
                          key={cat.slug}
                          className="rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-neutral-600"
                        >
                          {cat.name} · {cat.count}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="md:text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">Worth</p>
                    <p className="mt-2 text-4xl font-semibold leading-none text-neutral-950">{issue.totalScore}</p>
                    <div className="mt-4 md:ml-auto md:w-28">
                      <ScoreMeter score={issue.totalScore} />
                    </div>
                    <p className="mt-3 text-xs text-neutral-400">
                      {issue.candidateCount} 候选 · {issue.selectedCount} 入选
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </Container>
    </main>
  );
}

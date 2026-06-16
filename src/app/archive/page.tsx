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
            <p className="text-[13px]" style={{ color: "var(--muted)" }}>已收录期数</p>
            <p className="mt-2 text-[2.5rem] font-semibold leading-none tracking-[-0.03em]" style={{ color: "var(--ink)" }}>
              {issues.length}
            </p>
          </div>
        }
      />

      <Container className="py-8">
        {issues.length === 0 ? (
          <div
            className="surface-panel py-16 text-center text-[14px] font-medium"
            style={{ color: "var(--muted)" }}
          >
            暂无归档
          </div>
        ) : (
          <>
            <div
              className="surface-panel mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="font-mono text-[12px] font-medium tracking-[0.04em]" style={{ color: "var(--muted)" }}>
                第 {pagination.currentPage} / {pagination.pageCount} 页，每页最多 {pagination.pageSize} 期
              </p>
              <div className="flex gap-2">
                <Link
                  href={pagination.hasPreviousPage ? getArchivePageHref(pagination.currentPage - 1) : getArchivePageHref(pagination.currentPage)}
                  aria-disabled={!pagination.hasPreviousPage}
                  tabIndex={pagination.hasPreviousPage ? undefined : -1}
                  className={`btn-secondary h-9 text-[13px] ${
                    !pagination.hasPreviousPage ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  上一页
                </Link>
                <Link
                  href={pagination.hasNextPage ? getArchivePageHref(pagination.currentPage + 1) : getArchivePageHref(pagination.currentPage)}
                  aria-disabled={!pagination.hasNextPage}
                  tabIndex={pagination.hasNextPage ? undefined : -1}
                  className={`btn-secondary h-9 text-[13px] ${
                    !pagination.hasNextPage ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  下一页
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              {pagination.items.map((issue) => (
                <Link
                  key={issue.date}
                  href={`/daily/${issue.date}`}
                  className="surface-panel card-hover group grid gap-4 p-5 md:grid-cols-[150px_minmax(0,1fr)_160px]"
                >
                  <div>
                    <p className="section-kicker">Issue</p>
                    <p className="mt-2 font-mono text-[17px] font-semibold tracking-[-0.01em]" style={{ color: "var(--ink)" }}>
                      {issue.date}
                    </p>
                    <p className="mt-1 font-mono text-[11px] font-medium tracking-[0.04em]" style={{ color: "var(--muted)" }}>
                      第 {issue.issueNo} 期
                    </p>
                  </div>

                  <div className="min-w-0">
                    <h2
                      className="font-editorial text-[1.35rem] font-normal leading-[1.2] tracking-[-0.02em] transition-colors sm:text-[1.5rem]"
                      style={{ color: "var(--ink)" }}
                    >
                      {issue.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-[1.65]" style={{ color: "var(--ink-soft)" }}>
                      {issue.summary}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {issue.categories.map((cat) => (
                        <span key={cat.slug} className="tag-chip">
                          {cat.name} · {cat.count}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="md:text-right">
                    <p className="section-kicker">Worth</p>
                    <p className="mt-2 font-mono text-[2.25rem] font-semibold leading-none tracking-[-0.04em]" style={{ color: "var(--ink)" }}>
                      {issue.totalScore}
                    </p>
                    <div className="mt-4 md:ml-auto md:w-28">
                      <ScoreMeter score={issue.totalScore} />
                    </div>
                    <p className="mt-3 font-mono text-[11px] font-medium tracking-[0.04em]" style={{ color: "var(--muted)" }}>
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

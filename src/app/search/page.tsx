import Link from "next/link";
import { Container } from "@/app/_components/container";
import { EntryListCard } from "@/app/_components/entry-list-card";
import { PageHero } from "@/app/_components/page-hero";
import { searchSignalEntries } from "@/lib/catalog";
import { paginateItems } from "@/lib/pagination";

export const metadata = {
  title: "搜索",
  description: "按关键词搜索 AI 信号指数已发布日报中的标题、摘要、标签、来源和分类。",
  alternates: {
    canonical: "/search",
  },
};

type SearchPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
  }>;
};

const pageSize = 12;

function getSearchPageHref(query: string, page: number) {
  const params = new URLSearchParams();
  const normalizedQuery = query.trim();

  if (normalizedQuery) {
    params.set("q", normalizedQuery);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const nextQuery = params.toString();
  return nextQuery ? `/search?${nextQuery}` : "/search";
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const results = searchSignalEntries(query);
  const pagination = paginateItems(results, params.page, pageSize);

  return (
    <main>
      <PageHero
        eyebrow="Search"
        title="搜索日报信号"
        description="按标题、摘要、标签、来源和分类检索已发布日报内容。"
        aside={
          <p className="text-[14px] leading-[1.65]" style={{ color: "var(--ink-soft)" }}>
            覆盖标题、摘要、标签、来源和分类，结果会直接定位到对应日报条目。
          </p>
        }
      />

      <Container className="py-8">
        <form className="surface-panel p-5" action="/search">
          <label className="section-kicker" htmlFor="q">
            关键词
          </label>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              id="q"
              name="q"
              defaultValue={query}
              className="h-11 min-w-0 flex-1 rounded-lg px-3 text-[14px] font-medium outline-none transition"
              style={{
                background: "var(--surface-alt)",
                border: "1px solid var(--line)",
                color: "var(--ink)",
              }}
              placeholder="Agent、RAG、开源、模型..."
            />
            <button className="btn-primary h-11 px-5" type="submit">
              搜索
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[12px] font-medium tracking-[0.04em]" style={{ color: "var(--muted)" }}>
              {query && results.length > 0
                ? `找到 ${results.length} 条结果，当前显示 ${pagination.startIndex}-${pagination.endIndex}`
                : query
                  ? "找到 0 条结果"
                  : "输入关键词开始搜索"}
            </p>
            {query && results.length > pageSize ? (
              <div className="flex gap-2">
                <Link
                  href={pagination.hasPreviousPage ? getSearchPageHref(query, pagination.currentPage - 1) : getSearchPageHref(query, pagination.currentPage)}
                  aria-disabled={!pagination.hasPreviousPage}
                  tabIndex={pagination.hasPreviousPage ? undefined : -1}
                  className={`btn-secondary h-9 text-[13px] ${
                    !pagination.hasPreviousPage ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  上一页
                </Link>
                <span
                  className="flex h-9 items-center rounded-md px-3 text-[13px] font-medium"
                  style={{ background: "var(--surface-alt)", border: "1px solid var(--line)", color: "var(--muted)" }}
                >
                  {pagination.currentPage}/{pagination.pageCount}
                </span>
                <Link
                  href={pagination.hasNextPage ? getSearchPageHref(query, pagination.currentPage + 1) : getSearchPageHref(query, pagination.currentPage)}
                  aria-disabled={!pagination.hasNextPage}
                  tabIndex={pagination.hasNextPage ? undefined : -1}
                  className={`btn-secondary h-9 text-[13px] ${
                    !pagination.hasNextPage ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  下一页
                </Link>
              </div>
            ) : null}
          </div>
          {query && results.length === 0 ? (
            <div className="surface-panel py-16 text-center">
              <h2
                className="font-editorial text-[1.5rem] font-normal tracking-[-0.02em]"
                style={{ color: "var(--ink)" }}
              >
                没有找到匹配信号
              </h2>
              <p className="mt-2 text-[14px] font-medium leading-[1.65]" style={{ color: "var(--muted)" }}>
                可以换成更宽泛的关键词，例如模型、Agent、开源、产品或来源名称。
              </p>
            </div>
          ) : !query ? (
            <div className="surface-panel py-16 text-center">
              <h2
                className="font-editorial text-[1.5rem] font-normal tracking-[-0.02em]"
                style={{ color: "var(--ink)" }}
              >
                搜索历史信号
              </h2>
              <p className="mt-2 text-[14px] font-medium leading-[1.65]" style={{ color: "var(--muted)" }}>
                输入关键词后，会在标题、摘要、标签、来源和分类中检索。
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {pagination.items.map((item) => (
                <EntryListCard key={`${item.issueDate}-${item.rank}`} item={item} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}

import { Container } from "@/app/_components/container";
import { EntryListCard } from "@/app/_components/entry-list-card";
import { PageHero } from "@/app/_components/page-hero";
import { searchSignalEntries } from "@/lib/catalog";

export const metadata = {
  title: "搜索",
};

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const results = searchSignalEntries(query);

  return (
    <main>
      <PageHero
        eyebrow="Search"
        title="搜索日报信号"
        description="按标题、摘要、标签、来源和分类检索已发布日报内容。"
        aside={<p className="text-sm leading-6 text-neutral-300">当前是静态检索，后续内容增长后可替换为 Meilisearch 或数据库全文搜索。</p>}
      />

      <Container className="py-6">
        <form className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm" action="/search">
          <label className="text-sm font-semibold text-neutral-700" htmlFor="q">
            关键词
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id="q"
              name="q"
              defaultValue={query}
              className="h-11 min-w-0 flex-1 rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none focus:border-neutral-950"
              placeholder="Agent、RAG、开源、模型..."
            />
            <button className="h-11 rounded-md bg-neutral-950 px-4 text-sm font-semibold text-white hover:bg-neutral-800" type="submit">
              搜索
            </button>
          </div>
        </form>

        <div className="mt-6">
          <p className="mb-4 text-sm text-neutral-500">
            {query ? `找到 ${results.length} 条结果` : "输入关键词开始搜索"}
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {results.map((item) => (
              <EntryListCard key={`${item.issueDate}-${item.rank}`} item={item} />
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}

import { CategoryFilter } from "@/app/_components/category-filter";
import { Container } from "@/app/_components/container";
import { IssuePanel } from "@/app/_components/issue-panel";
import { SidebarPanel } from "@/app/_components/sidebar-panel";
import { SignalCard } from "@/app/_components/signal-card";
import { getFilteredItems, getLatestIssue } from "@/lib/issues";

type HomeProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

export default async function Index({ searchParams }: HomeProps) {
  const params = await searchParams;
  const issue = getLatestIssue();

  if (!issue) {
    return (
      <main>
        <Container className="py-16">
          <h1 className="text-3xl font-semibold text-neutral-950">暂无日报</h1>
        </Container>
      </main>
    );
  }

  const activeCategory = params.category ?? "all";
  const items = getFilteredItems(issue, activeCategory);

  return (
    <main>
      <IssuePanel issue={issue} />

      <Container className="grid gap-8 py-8 lg:grid-cols-[1fr_300px]">
        {/* Main content */}
        <section className="min-w-0">
          <CategoryFilter categories={issue.categories} activeCategory={activeCategory} />
          <div className="mt-2">
            {items.length === 0 ? (
              <p className="py-12 text-center text-sm text-neutral-400">
                该分类暂无信号
              </p>
            ) : (
              items.map((item) => (
                <SignalCard key={item.rank} item={item} />
              ))
            )}
          </div>
        </section>

        {/* Sidebar */}
        <SidebarPanel issue={issue} />
      </Container>
    </main>
  );
}

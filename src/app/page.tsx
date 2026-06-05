import Link from "next/link";
import { CategoryFilter } from "@/app/_components/category-filter";
import { Container } from "@/app/_components/container";
import { IssuePanel } from "@/app/_components/issue-panel";
import { MethodCard } from "@/app/_components/method-card";
import { ScoreMeter } from "@/app/_components/score-meter";
import { SignalCard } from "@/app/_components/signal-card";
import { getFilteredItems, getLatestIssue, getTopTags } from "@/lib/issues";

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
  const topTags = getTopTags(issue.items);

  return (
    <main>
      <IssuePanel issue={issue} />

      <Container className="grid gap-6 py-6 lg:grid-cols-[248px_1fr_320px]">
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <section className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Navigator</p>
            <div className="mt-4 space-y-2">
              <Link className="flex h-10 items-center justify-between rounded-md bg-neutral-950 px-3 text-sm font-semibold text-white" href="/">
                今日精选
                <span>{issue.selectedCount}</span>
              </Link>
              <Link className="flex h-10 items-center justify-between rounded-md border border-neutral-200 px-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400" href="/archive">
                历史归档
                <span>{issue.issueNo}</span>
              </Link>
              <Link className="flex h-10 items-center justify-between rounded-md border border-neutral-200 px-3 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400" href="/about">
                评分方法
                <span>6 项</span>
              </Link>
            </div>
          </section>

          <section className="rounded-md border border-neutral-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Top Tags</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {topTags.map(([tag, count]) => (
                <span key={tag} className="rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-neutral-700">
                  {tag} · {count}
                </span>
              ))}
            </div>
          </section>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Selected Signals</p>
              <h2 className="mt-2 text-2xl font-semibold text-neutral-950">今日入选信号</h2>
            </div>
            <p className="text-sm text-neutral-500">从 {issue.candidateCount} 条候选中筛出 {items.length} 条</p>
          </div>
          <CategoryFilter categories={issue.categories} activeCategory={activeCategory} />
          <div className="mt-5 space-y-4">
            {items.map((item) => (
              <SignalCard key={item.rank} item={item} />
            ))}
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <section className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Category Pulse</p>
                <h2 className="mt-2 text-base font-semibold text-neutral-950">分类热度</h2>
              </div>
              <Link href={`/daily/${issue.date}`} className="text-sm font-semibold text-neutral-700 hover:text-neutral-950">
                详情
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              {issue.categories.map((category) => (
                <div key={category.slug}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-neutral-800">{category.name}</span>
                    <span className="text-neutral-500">{category.score}</span>
                  </div>
                  <ScoreMeter score={category.score} />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-neutral-900 bg-neutral-950 p-5 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Runbook</p>
            <h2 className="mt-3 text-lg font-semibold">下一步运营动作</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-neutral-300">
              <p>1. 替换示例信号为真实来源链接。</p>
              <p>2. 运行校验脚本检查日报结构。</p>
              <p>3. 人工复核摘要和排序后发布。</p>
            </div>
          </section>

          <section className="space-y-3">
            <MethodCard
              label="可操作性"
              value={30}
              description="内容能否直接影响选型、产品判断、研发投入或业务动作。"
            />
            <MethodCard
              label="行业影响"
              value={20}
              description="信号是否可能改变竞争格局、生态路线或用户预期。"
            />
          </section>
        </aside>
      </Container>
    </main>
  );
}

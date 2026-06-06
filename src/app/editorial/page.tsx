import { Container } from "@/app/_components/container";
import { PageHero } from "@/app/_components/page-hero";

export const metadata = {
  title: "编辑政策",
  description: "了解 AI 信号指数的来源优先、事实判断分离、人工复核和公开发布门禁。",
  alternates: {
    canonical: "/editorial",
  },
};

const rules = [
  ["来源优先", "每条内容都尽量保留原始来源链接；无法确认来源时，只能进入候选池，不进入公开日报。"],
  ["事实和判断分离", "摘要只描述事实，价值判断写入影响分析，避免把推断包装成确定结论。"],
  ["重复内容降权", "同一事件被多方转述时，优先保留一手来源或信息增量最高的版本。"],
  ["公开前复核", "采集脚本负责候选和草稿，标题、摘要、排序、评分和来源链接必须经过发布前检查。"],
  ["版权边界", "不搬运全文，不长段复制原文，只提供短摘要、来源链接和独立判断。"],
  ["更正透明", "发现错误后优先修正公开内容；需要说明时，在后续日报或仓库记录中保留更正线索。"],
];

const workflow = [
  ["01", "采集候选", "从 sources.json 中启用的 RSS、HTML 和授权来源生成候选池。"],
  ["02", "生成草稿", "按评分、时效、来源权重和主题分布挑选日报候选。"],
  ["03", "编辑检查", "核对原文链接、标题事实、分类、摘要口径和影响判断。"],
  ["04", "发布验证", "通过内容校验、测试、lint 和 build 后再进入部署流程。"],
];

export default function EditorialPage() {
  return (
    <main>
      <PageHero
        eyebrow="Editorial"
        title="编辑政策"
        description="AI 信号指数不是全量搬运站，而是面向从业者的高信噪比筛选和复核流程。"
        aside={
          <div className="space-y-3 text-sm leading-6">
            <p className="font-semibold text-white">目标是让每条公开信号都可追溯、可判断、可纠错。</p>
            <p>机器负责扩展候选视野，编辑流程负责压低误读、重复和营销噪音。</p>
          </div>
        }
      />

      <section className="editorial-shell">
        <Container className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">Principles</p>
                <h2 className="mt-2 text-2xl font-semibold text-neutral-950">公开内容原则</h2>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {rules.map(([title, description]) => (
                <section key={title} className="editorial-card rounded-md p-5">
                  <h3 className="text-lg font-semibold text-neutral-950">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-neutral-600">{description}</p>
                </section>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <section className="editorial-card rounded-md p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">Workflow</p>
              <h2 className="mt-3 text-xl font-semibold text-neutral-950">日报发布流程</h2>
              <div className="mt-5 space-y-5">
                {workflow.map(([step, title, description]) => (
                  <div key={step} className="flex gap-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-neutral-950 text-sm font-semibold text-white">
                      {step}
                    </span>
                    <div>
                      <h3 className="font-semibold text-neutral-950">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-neutral-600">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-md border border-emerald-900 bg-neutral-950 p-5 text-white shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">Quality Gate</p>
              <h2 className="mt-3 text-xl font-semibold">发布前门禁</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-300">
                公开日报必须通过结构校验、来源链接校验、内部草稿话术检查、内容契约测试和生产构建检查。
              </p>
            </section>
          </aside>
        </Container>
      </section>
    </main>
  );
}

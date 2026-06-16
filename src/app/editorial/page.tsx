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
          <div className="space-y-3 text-[14px] leading-[1.65]" style={{ color: "var(--ink-soft)" }}>
            <p className="font-semibold" style={{ color: "var(--ink)" }}>
              目标是让每条公开信号都可追溯、可判断、可纠错。
            </p>
            <p>机器负责扩展候选视野，编辑流程负责压低误读、重复和营销噪音。</p>
          </div>
        }
      />

      <Container className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-kicker">Principles</p>
              <h2
                className="font-editorial mt-3 text-[1.75rem] font-normal leading-[1.15] tracking-[-0.02em] sm:text-[2rem]"
                style={{ color: "var(--ink)" }}
              >
                公开内容原则
              </h2>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {rules.map(([title, description]) => (
              <section key={title} className="surface-panel card-hover p-5">
                <h3
                  className="font-editorial text-[1.25rem] font-normal leading-[1.2] tracking-[-0.02em]"
                  style={{ color: "var(--ink)" }}
                >
                  {title}
                </h3>
                <p className="mt-3 text-[14px] font-medium leading-[1.65]" style={{ color: "var(--ink-soft)" }}>
                  {description}
                </p>
              </section>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <section className="surface-panel p-5">
            <p className="section-kicker">Workflow</p>
            <h2
              className="font-editorial mt-3 text-[1.5rem] font-normal leading-[1.15] tracking-[-0.02em]"
              style={{ color: "var(--ink)" }}
            >
              日报发布流程
            </h2>
            <div className="mt-5 space-y-0">
              {workflow.map(([step, title, description], i) => (
                <div
                  key={step}
                  className="grid grid-cols-[44px_minmax(0,1fr)] gap-3 border-t py-3"
                  style={{ borderColor: "var(--line)" }}
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-md font-mono text-[12px] font-semibold"
                    style={{ background: "var(--surface-alt)", color: "var(--muted)" }}
                  >
                    {step}
                  </span>
                  <div>
                    <h3 className="text-[14px] font-semibold" style={{ color: "var(--ink)" }}>{title}</h3>
                    <p className="mt-1 text-[13px] leading-[1.6]" style={{ color: "var(--muted)" }}>{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-panel p-5" style={{ background: "var(--pastel-red)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--pastel-red-text)" }}>
              Quality Gate
            </p>
            <h2
              className="font-editorial mt-3 text-[1.5rem] font-normal leading-[1.15] tracking-[-0.02em]"
              style={{ color: "var(--pastel-red-text)" }}
            >
              发布前门禁
            </h2>
            <p className="mt-3 text-[14px] font-medium leading-[1.65]" style={{ color: "var(--pastel-red-text)", opacity: 0.85 }}>
              公开日报必须通过结构校验、来源链接校验、内部草稿话术检查、内容契约测试和生产构建检查。
            </p>
          </section>
        </aside>
      </Container>
    </main>
  );
}

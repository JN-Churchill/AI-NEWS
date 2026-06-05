import { Container } from "@/app/_components/container";
import { PageHero } from "@/app/_components/page-hero";

export const metadata = {
  title: "编辑政策",
};

const rules = [
  ["来源优先", "每条内容必须尽量保留原始来源链接；无法确认来源时，只能作为候选，不进入正式发布。"],
  ["事实和判断分离", "摘要描述事实，价值判断写在 whyItMatters 中，避免把推断包装成事实。"],
  ["重复内容降权", "同一事件被多家媒体重复传播时，优先保留一手来源或信息增量最高的版本。"],
  ["人工复核", "采集脚本只生成候选池和草稿，最终标题、摘要、排序和评分需要人工确认。"],
  ["版权边界", "不搬运全文，不长段复制原文，只做短摘要、来源链接和独立判断。"],
];

export default function EditorialPage() {
  return (
    <main>
      <PageHero
        eyebrow="Editorial"
        title="编辑政策"
        description="AI 信号指数不是全量搬运站，而是面向从业者的高信噪比筛选和复核流程。"
      />
      <Container className="grid gap-4 py-6 md:grid-cols-2">
        {rules.map(([title, description]) => (
          <section key={title} className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-950">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">{description}</p>
          </section>
        ))}
      </Container>
    </main>
  );
}

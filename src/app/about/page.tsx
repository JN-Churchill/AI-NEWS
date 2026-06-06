import { Container } from "@/app/_components/container";
import { MethodCard } from "@/app/_components/method-card";

export const metadata = {
  title: "评分方法",
};

const methods = [
  {
    label: "可操作性",
    value: 30,
    description: "是否能帮助读者做出产品、研发、投资、采购或学习判断。",
  },
  {
    label: "技术/产品增量",
    value: 20,
    description: "是否出现新的能力边界、成本变化、交互形态或工程实践。",
  },
  {
    label: "行业影响",
    value: 20,
    description: "是否可能影响市场竞争、生态站位、开发者选择或企业预算。",
  },
  {
    label: "来源可信度",
    value: 15,
    description: "优先一手来源、可复核数据、论文、代码仓库和正式公告。",
  },
  {
    label: "受众契合度",
    value: 10,
    description: "是否符合中文 AI 从业者、开发者、创业者和产品团队的关注重点。",
  },
  {
    label: "新鲜度",
    value: 5,
    description: "是否是当天仍有决策价值的新信号，而不是重复传播的旧信息。",
  },
];

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b border-neutral-900 bg-neutral-950 text-white">
        <Container className="py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
            Method
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">评分方法</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
            这个站不追求全量新闻，而是把每天最可能影响判断的内容筛出来。机器负责初筛和摘要，人工负责最终入选、排序和标题口径。
          </p>
          <div className="mt-6 grid gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 text-sm sm:grid-cols-3">
            <div className="bg-neutral-950 p-4">
              <p className="text-xs text-neutral-500">原则一</p>
              <p className="mt-1 text-sm text-neutral-300">保留原始来源，不做无出处二次搬运。</p>
            </div>
            <div className="bg-neutral-950 p-4">
              <p className="text-xs text-neutral-500">原则二</p>
              <p className="mt-1 text-sm text-neutral-300">区分事实、推断和建议，避免把营销话术当结论。</p>
            </div>
            <div className="bg-neutral-950 p-4">
              <p className="text-xs text-neutral-500">原则三</p>
              <p className="mt-1 text-sm text-neutral-300">对重复传播内容降权，对一手信号和可复核材料加权。</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Method cards */}
      <Container className="py-8">
        <div className="divide-y divide-neutral-200">
          {methods.map((method) => (
            <MethodCard key={method.label} {...method} />
          ))}
        </div>
      </Container>
    </main>
  );
}

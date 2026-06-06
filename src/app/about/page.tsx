import { Container } from "@/app/_components/container";
import { MethodCard } from "@/app/_components/method-card";
import { PageHero } from "@/app/_components/page-hero";

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
      <PageHero
        eyebrow="Method"
        title="评分方法"
        description="这个站不追求全量新闻，而是把每天最可能影响判断的内容筛出来。机器负责初筛和摘要，人工负责最终入选、排序和标题口径。"
        aside={
          <div className="space-y-3 text-sm leading-6">
            <p>保留原始来源，不做无出处二次搬运。</p>
            <p>区分事实、推断和建议，避免把营销话术当结论。</p>
            <p>对重复传播内容降权，对一手信号和可复核材料加权。</p>
          </div>
        }
      />

      <Container className="py-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {methods.map((method) => (
            <MethodCard key={method.label} {...method} />
          ))}
        </div>
      </Container>
    </main>
  );
}

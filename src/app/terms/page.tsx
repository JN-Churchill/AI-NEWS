import Link from "next/link";
import { Container } from "@/app/_components/container";
import { PageHero } from "@/app/_components/page-hero";
import { SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: "使用条款",
  description: "了解 AI 信号指数公开内容、来源链接、订阅入口、纠错反馈和免责声明的使用边界。",
  alternates: {
    canonical: "/terms",
  },
};

const terms = [
  ["内容边界", "站点提供公开 AI 行业信号、来源链接、摘要和编辑判断，用于信息参考，不构成投资、法律、医疗或采购建议。"],
  ["来源归属", "每条信号尽量保留原始来源链接。外部页面、论文、仓库和公告由其原发布方负责。"],
  ["纠错反馈", "欢迎提交标题、摘要、分类、评分或来源链接相关的问题。更正会优先以公开内容修订和可追踪记录处理。"],
  ["服务可用性", "站点可能因构建、部署、来源失效或第三方服务变化而短暂不可用。Feed 内容以已发布日报为准。"],
];

export default function TermsPage() {
  return (
    <main>
      <PageHero
        eyebrow="Terms"
        title="使用条款"
        description={`${SITE_NAME} 面向公开阅读和订阅分发。这里说明内容引用、外部来源、纠错反馈和使用责任边界。`}
        aside={
          <p className="text-[14px] leading-[1.65]" style={{ color: "var(--ink-soft)" }}>
            继续访问或订阅公开 Feed，即表示你理解这些内容仅供信息参考。
          </p>
        }
      />

      <Container className="py-10">
        <div className="grid gap-4 md:grid-cols-2">
          {terms.map(([title, description]) => (
            <section key={title} className="surface-panel p-5">
              <h2
                className="font-editorial text-[1.25rem] font-normal leading-[1.2] tracking-[-0.02em]"
                style={{ color: "var(--ink)" }}
              >
                {title}
              </h2>
              <p className="mt-3 text-[14px] font-medium leading-[1.65]" style={{ color: "var(--ink-soft)" }}>
                {description}
              </p>
            </section>
          ))}
        </div>

        <section className="surface-panel mt-6 p-5">
          <p className="section-kicker">Corrections</p>
          <h2
            className="font-editorial mt-3 text-[1.5rem] font-normal leading-[1.15] tracking-[-0.02em]"
            style={{ color: "var(--ink)" }}
          >
            发现问题
          </h2>
          <p className="mt-3 text-[14px] font-medium leading-[1.65]" style={{ color: "var(--ink-soft)" }}>
            请附上日报日期、条目编号、问题位置和建议修正文本，方便快速定位并处理。
          </p>
          <Link href="/contact" className="btn-primary mt-4 inline-flex">
            提交反馈
          </Link>
        </section>
      </Container>
    </main>
  );
}

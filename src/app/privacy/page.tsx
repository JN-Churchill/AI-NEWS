import Link from "next/link";
import { Container } from "@/app/_components/container";
import { PageHero } from "@/app/_components/page-hero";
import { SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: "隐私说明",
  description: "了解 AI 信号指数公开站点在访问、订阅、纠错和联系流程中的数据边界。",
  alternates: {
    canonical: "/privacy",
  },
};

const sections = [
  ["公开访问", "站点内容默认公开访问。页面本身不要求登录，也不在前端收集账号、密码或支付信息。"],
  ["订阅入口", "RSS 和 JSON Feed 是公开地址。邮件订阅如接入第三方服务，会以对应服务的隐私政策和退订机制为准。"],
  ["联系与纠错", "通过 GitHub Issue 或邮件提交的内容可能包含公开记录。请不要在纠错、投稿或合作信息中写入敏感个人信息。"],
  ["环境变量", "站点只通过环境变量读取公开站点地址、联系邮箱和 Newsletter 链接，不把密钥或凭据写入前端页面。"],
];

export default function PrivacyPage() {
  return (
    <main>
      <PageHero
        eyebrow="Privacy"
        title="隐私说明"
        description={`${SITE_NAME} 是公开 AI 新闻与信号索引站点。这里说明访问、订阅、纠错和联系流程中的数据边界。`}
        aside={
          <p className="text-[14px] leading-[1.65]" style={{ color: "var(--ink-soft)" }}>
            如果需要删除或更正你提交的公开信息，请通过联系入口说明原链接和处理诉求。
          </p>
        }
      />

      <Container className="py-10">
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map(([title, description]) => (
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
          <p className="section-kicker">Contact</p>
          <h2
            className="font-editorial mt-3 text-[1.5rem] font-normal leading-[1.15] tracking-[-0.02em]"
            style={{ color: "var(--ink)" }}
          >
            隐私相关请求
          </h2>
          <p className="mt-3 text-[14px] font-medium leading-[1.65]" style={{ color: "var(--ink-soft)" }}>
            如需处理你提交的公开信息，请提供页面地址、提交渠道和需要处理的具体内容。
          </p>
          <Link href="/contact" className="btn-primary mt-4 inline-flex">
            联系我们
          </Link>
        </section>
      </Container>
    </main>
  );
}

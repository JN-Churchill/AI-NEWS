import Link from "next/link";
import { Container } from "@/app/_components/container";
import { PageHero } from "@/app/_components/page-hero";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata = {
  title: "订阅",
  description: "通过 RSS、JSON Feed 或 Newsletter 订阅 AI 信号指数的每日 AI 行业信号。",
  alternates: {
    canonical: "/subscribe",
  },
};

const newsletterUrl = process.env.NEXT_PUBLIC_NEWSLETTER_URL;

const subscriptionCards = [
  {
    eyebrow: "RSS",
    title: "RSS 订阅",
    description: "适合在 Feedly、Inoreader、NetNewsWire 等阅读器中持续接收每日信号。",
    href: "/rss.xml",
    action: "打开 RSS",
  },
  {
    eyebrow: "JSON Feed",
    title: "JSON Feed",
    description: "适合自动化脚本、内部系统或支持 JSON Feed 的阅读器接入。",
    href: "/feed.json",
    action: "打开 Feed",
  },
  {
    eyebrow: "Newsletter",
    title: "邮件分发",
    description: newsletterUrl
      ? "通过邮件接收日报更新，适合轻量阅读和团队转发。"
      : "如需团队邮件分发、Newsletter 联动或企业内部摘要，可以提交订阅需求。",
    href: newsletterUrl || "/contact",
    action: newsletterUrl ? "加入 Newsletter" : "联系订阅",
  },
];

export default function SubscribePage() {
  return (
    <main>
      <PageHero
        eyebrow="Subscribe"
        title="订阅 AI 信号指数"
        description="选择适合你的接收方式：阅读器、自动化 Feed，或邮件分发。所有订阅内容都来自已发布日报。"
        aside={
          <div className="space-y-3 text-[14px] leading-[1.65]" style={{ color: "var(--ink-soft)" }}>
            <p className="font-semibold" style={{ color: "var(--ink)" }}>{SITE_NAME}</p>
            <p>公开 Feed 地址可直接复制到阅读器或内部聚合工具。</p>
          </div>
        }
      />

      <Container className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4 md:grid-cols-3">
          {subscriptionCards.map((card) => {
            const external = card.href.startsWith("http");

            return (
              <article key={card.title} className="surface-panel card-hover flex min-h-64 flex-col p-5">
                <p className="section-kicker">{card.eyebrow}</p>
                <h2
                  className="font-editorial mt-3 text-[1.5rem] font-normal leading-[1.15] tracking-[-0.02em]"
                  style={{ color: "var(--ink)" }}
                >
                  {card.title}
                </h2>
                <p className="mt-3 flex-1 text-[14px] font-medium leading-[1.65]" style={{ color: "var(--ink-soft)" }}>
                  {card.description}
                </p>
                <Link
                  href={card.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                  className="btn-primary mt-5 w-fit"
                >
                  {card.action}
                </Link>
              </article>
            );
          })}
        </div>

        <aside className="surface-panel p-5">
          <p className="section-kicker">Feed URLs</p>
          <h2
            className="font-editorial mt-3 text-[1.5rem] font-normal leading-[1.15] tracking-[-0.02em]"
            style={{ color: "var(--ink)" }}
          >
            公开订阅地址
          </h2>
          <div className="mt-5 space-y-4 text-[14px] font-medium leading-[1.65]" style={{ color: "var(--ink-soft)" }}>
            <div>
              <p className="font-semibold" style={{ color: "var(--ink)" }}>RSS</p>
              <p
                className="mt-1 break-all rounded-lg px-3 py-2 font-mono text-[12px] font-medium"
                style={{ background: "var(--surface-alt)", border: "1px solid var(--line)", color: "var(--ink-soft)" }}
              >
                {SITE_URL}/rss.xml
              </p>
            </div>
            <div>
              <p className="font-semibold" style={{ color: "var(--ink)" }}>JSON Feed</p>
              <p
                className="mt-1 break-all rounded-lg px-3 py-2 font-mono text-[12px] font-medium"
                style={{ background: "var(--surface-alt)", border: "1px solid var(--line)", color: "var(--ink-soft)" }}
              >
                {SITE_URL}/feed.json
              </p>
            </div>
          </div>
        </aside>
      </Container>
    </main>
  );
}

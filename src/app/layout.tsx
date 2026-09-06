import type { Metadata } from "next";

import "./globals.css";
import { BackToTop } from "@/components/back-to-top";
import { SiteHeader } from "@/components/site-header";

const SITE_NAME = "AI 日报";
const SITE_DESC = "每天自动抓取全网 AI 热点，去重打分后生成一份五分钟读完的 AI 日报。";

const SITE_URL = process.env["SITE_URL"] ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · 五分钟看完今日 AI`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESC,
  keywords: ["AI", "人工智能", "日报", "大模型", "AI 新闻", "LLM"],
  openGraph: {
    title: `${SITE_NAME} · 五分钟看完今日 AI`,
    description: SITE_DESC,
    type: "website",
    locale: "zh_CN",
    images: ["/og.png"],
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/rss.xml",
      "application/feed+json": "/feed.json",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteHeader />
        <main className="mx-auto w-full max-w-[1180px] px-5 pt-[76px] pb-16">{children}</main>
        <footer className="border-t border-white/8 px-5 py-10">
          <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center gap-3 text-center text-sm text-[var(--color-ink-3)]">
            <p>
              {SITE_NAME} · 每日自动聚合全网 AI 热点，经去重与热度打分后生成
            </p>
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <a className="transition-colors hover:text-[var(--color-brand-1)]" href="/rss.xml">
                RSS
              </a>
              <span>·</span>
              <a className="transition-colors hover:text-[var(--color-brand-1)]" href="/feed.json">
                JSON Feed
              </a>
              <span>·</span>
              <a className="transition-colors hover:text-[var(--color-brand-1)]" href="/archive">
                历史归档
              </a>
              <span>·</span>
              <a className="transition-colors hover:text-[var(--color-brand-1)]" href="/about">
                评分方法
              </a>
            </p>
            <p className="text-xs">内容版权归各来源作者所有 · 本站仅作聚合与索引</p>
          </div>
        </footer>
        <BackToTop />
      </body>
    </html>
  );
}

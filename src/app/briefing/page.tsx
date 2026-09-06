import type { Metadata } from "next";
import Link from "next/link";

import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getAihotByDate, getAihotDates } from "@/lib/aihot";
import { formatAihotDateTitle, formatAihotDateTime } from "@/lib/aihot-format";

export const metadata: Metadata = {
  title: `AI HOT 日报看板 | ${SITE_NAME}`,
  description: "AI HOT 日报的站内看板：五色版块速览每日模型、产品、行业、论文与观点动态。",
  alternates: { canonical: `${SITE_URL}/briefing` },
};

function ExternalIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 5h5v5" />
      <path d="M19 5 10 14" />
      <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </svg>
  );
}

export default function BriefingIndexPage() {
  const dates = getAihotDates();

  if (dates.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <section className="surface-panel max-w-3xl p-8">
          <p className="section-kicker">AI HOT 日报</p>
          <h1 className="editorial-title mt-4 text-2xl font-bold">暂无日报看板</h1>
          <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
            还没有拉取过 AI HOT 日报数据。运行下面的命令生成第一期后，这里会列出所有可用的看板日期。
          </p>
          <code className="mt-4 inline-block bg-surface px-3 py-2 font-mono text-[12.5px]" style={{ background: "var(--surface-alt)", color: "var(--ink-soft)" }}>
            npm run ingest:aihot
          </code>
        </section>
      </main>
    );
  }

  const [latestDate] = dates;
  const latest = latestDate ? getAihotByDate(latestDate) : null;

  return (
    <main className="mx-auto max-w-[960px] px-5 py-12 sm:px-6">
      <p className="section-kicker">AI HOT 日报</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="editorial-title text-3xl font-bold">AI 晨报看板</h1>
        {latest ? (
          <Link href={`/briefing/${latest.date}`} className="btn-primary">
            查看最新一期
            <ExternalIcon />
          </Link>
        ) : null}
      </div>
      <p className="mt-2 text-[13.5px]" style={{ color: "var(--muted)" }}>
        每日五版块速览：模型发布/更新、产品发布/更新、行业动态、论文研究、技巧与观点。
      </p>

      <div className="mt-8 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {dates.map((date) => {
          const daily = getAihotByDate(date);
          if (!daily) {
            return null;
          }
          return (
            <Link key={date} href={`/briefing/${date}`} className="editorial-card card-hover flex flex-col gap-1.5 p-4">
              <span className="editorial-title text-[15px] font-bold">{formatAihotDateTitle(daily.date)}</span>
              <span className="text-[12px]" style={{ color: "var(--muted)" }}>
                共 {daily.itemCount} 条　·　生成于 {formatAihotDateTime(daily.generatedAt)}
              </span>
              <span className="text-[11.5px]" style={{ color: "var(--muted)" }}>
                精确时间 {daily.matchedCount - daily.discoveryCount} 条　·　收录时间 {daily.discoveryCount} 条
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

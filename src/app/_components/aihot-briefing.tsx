import type { AihotDaily } from "@/lib/aihot-schema";
import {
  formatAihotDateTitle,
  formatAihotDateTime,
  formatAihotRange,
  getSectionMeta,
} from "@/lib/aihot-format";
import { AihotAnchorNav, type AihotAnchorSection } from "./aihot-anchor-nav";
import { AihotItemCard } from "./aihot-item-card";

interface AihotBriefingProps {
  daily: AihotDaily;
}

function ExternalIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 5h5v5" />
      <path d="M19 5 10 14" />
      <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </svg>
  );
}

/**
 * AI HOT 日报看板内芯（server component，build 期渲染完成）。
 * 视觉：参考 ai-daily 仪表盘的五色版式 + 站点 surface/token 外壳。
 */
export function AihotBriefing({ daily }: AihotBriefingProps) {
  const sectionViews = daily.sections.map((section, index) => {
    const meta = getSectionMeta(section.label);
    // 全局连续编号：起始序号 = 前序版块条数之和 + 1（纯计算，避免渲染期变量重赋值）
    const startNo =
      daily.sections.slice(0, index).reduce((sum, previous) => sum + previous.items.length, 0) + 1;
    const items = section.items.map((item, itemIndex) => ({ item, no: startNo + itemIndex }));
    return {
      id: `aihot-section-${index + 1}`,
      label: section.label,
      meta,
      startNo,
      endNo: startNo + section.items.length - 1,
      count: items.length,
      items,
    };
  });

  const visibleSections = sectionViews.filter((section) => section.count > 0);

  const anchorSections: AihotAnchorSection[] = visibleSections.map((section) => ({
    id: section.id,
    label: section.label,
    count: section.count,
    color: section.meta.color,
  }));

  const shareBase = Math.max(daily.itemCount, 1);

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <header className="border-b" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
        <div className="mx-auto max-w-[960px] px-5 py-10 sm:px-6">
          <p className="section-kicker">AI HOT 日报 · 站内看板</p>
          <h1 className="editorial-title mt-3 text-[28px] font-bold sm:text-[34px]">
            AI 晨报 · {formatAihotDateTitle(daily.date)}
          </h1>
          <p className="mt-2.5 text-[13px]" style={{ color: "var(--muted)" }}>
            收录窗口{" "}
            <span className="font-mono" style={{ color: "var(--ink-soft)" }}>
              {formatAihotRange(daily.windowStart, daily.windowEnd)}
            </span>
            （北京时间）　·　生成于 {formatAihotDateTime(daily.generatedAt)}　·　共 {daily.itemCount} 条
          </p>
          {daily.lead ? (
            <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
              {daily.lead}
            </p>
          ) : null}

          {/* 统计：总条数 + 五版块占比 chips */}
          <div className="mt-6 flex flex-wrap items-stretch gap-3">
            <div className="editorial-card flex min-w-[116px] flex-col justify-center px-5 py-3">
              <span className="font-mono text-[30px] font-medium leading-none" style={{ color: "var(--ink)" }}>
                {daily.itemCount}
              </span>
              <span className="section-kicker mt-1.5">总条数</span>
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap gap-2.5">
              {sectionViews.map((section) => {
                const percent = Math.round((section.count / shareBase) * 100);
                const chipBody = (
                  <>
                    <span className="font-mono text-[18px] font-medium leading-none" style={{ color: section.meta.color }}>
                      {section.count}
                    </span>
                    <span className="mt-1 whitespace-nowrap text-[11.5px]" style={{ color: "var(--ink-soft)" }}>
                      {section.label}
                    </span>
                    <span className="aihot-chip-bar mt-2">
                      <i style={{ width: `${percent}%`, background: section.meta.color }} />
                    </span>
                  </>
                );

                return section.count > 0 ? (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="editorial-card card-hover flex min-w-[106px] flex-1 flex-col px-3.5 py-2.5"
                  >
                    {chipBody}
                  </a>
                ) : (
                  <div key={section.id} className="editorial-card flex min-w-[106px] flex-1 flex-col px-3.5 py-2.5 opacity-50">
                    {chipBody}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <AihotAnchorNav sections={anchorSections} />

      {/* ---------- 版块与卡片 ---------- */}
      <div className="mx-auto max-w-[960px] space-y-10 px-5 py-8 sm:px-6">
        {visibleSections.length === 0 ? (
          <section className="surface-panel p-8 text-center">
            <p className="editorial-title text-lg font-bold">本期暂无条目</p>
            <p className="mt-2 text-[13px]" style={{ color: "var(--muted)" }}>
              AI HOT 侧本期日报没有返回任何条目，可以稍后用 --force 重新拉取。
            </p>
          </section>
        ) : (
          visibleSections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-[124px]">
              <div className="mb-4 flex items-center gap-2.5">
                <span className="h-5 w-1 shrink-0 rounded-sm" style={{ background: section.meta.color }} aria-hidden="true" />
                <h2 className="editorial-title text-[17px] font-bold">{section.label}</h2>
                <span className="font-mono text-[11px]" style={{ color: "var(--muted)" }}>
                  {section.startNo === section.endNo
                    ? `第 ${section.startNo} 条`
                    : `第 ${section.startNo}–${section.endNo} 条`}{" "}
                  · 共 {section.count} 条
                </span>
              </div>
              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map(({ item, no }) => (
                  <AihotItemCard key={no} item={item} no={no} color={section.meta.color} soft={section.meta.soft} />
                ))}
              </div>
            </section>
          ))
        )}

        {/* ---------- 数据说明 ---------- */}
        <footer className="signal-divider pt-5 text-[12px]" style={{ color: "var(--muted)" }}>
          <p>
            本期共 {daily.itemCount} 条　·　数据源：
            <a
              href={daily.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link font-medium"
              style={{ color: "var(--accent)" }}
            >
              AI HOT 日报 {daily.date}
              <ExternalIcon />
            </a>
          </p>
          <p className="mt-1.5">
            页面时间均为北京时间
            {daily.discoveryCount > 0
              ? `；其中 ${daily.discoveryCount} 条标注「发现时间」，即原文未提供精确发布时间、以 AI HOT 收录时间为准`
              : ""}
            。第三方原文版权归各来源方所有。
          </p>
        </footer>
      </div>
    </div>
  );
}

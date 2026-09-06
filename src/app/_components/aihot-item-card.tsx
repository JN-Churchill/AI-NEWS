import type { AihotItem } from "@/lib/aihot-schema";
import { formatAihotDateTime, truncateSummary } from "@/lib/aihot-format";

interface AihotItemCardProps {
  item: AihotItem;
  /** 全局连续序号（跨版块累加，不重置） */
  no: number;
  color: string;
  soft: string;
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
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

export function AihotItemCard({ item, no, color, soft }: AihotItemCardProps) {
  const timeLabel = item.publishedAt ? formatAihotDateTime(item.publishedAt) : "AI HOT 收录";

  return (
    <article id={`aihot-${no}`} className="editorial-card card-hover flex scroll-mt-[124px] flex-col gap-2.5 p-4">
      <div className="flex items-center gap-2">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center font-mono text-[12px] font-medium"
          style={{ background: soft, color }}
        >
          {no}
        </span>
        {item.sourceName ? (
          <span
            className="min-w-0 truncate rounded-full px-2 py-0.5 text-[11px]"
            style={{ background: "var(--surface)", border: "0.5px solid var(--line)", color: "var(--muted)" }}
            title={item.sourceName}
          >
            {item.sourceName}
          </span>
        ) : null}
      </div>

      <h3 className="text-[15px] font-semibold leading-snug" style={{ color: "var(--ink)" }}>
        <a
          href={item.aihotUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover-underline"
          aria-label={`阅读 ${item.title}（AI HOT 条目页）`}
        >
          {item.title}
        </a>
      </h3>

      {item.summary ? (
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          {truncateSummary(item.summary, 60)}
        </p>
      ) : null}

      <div className="mt-auto flex items-center justify-between gap-2 pt-2 signal-divider">
        <span className="inline-flex min-w-0 items-center gap-1.5 font-mono text-[11px]" style={{ color: "var(--muted)" }}>
          <ClockIcon />
          <span className="truncate">
            {timeLabel}
            {item.isDiscoveryTime ? " ·发现时间" : ""}
          </span>
        </span>
        {item.originalUrl ? (
          <a
            href={item.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary shrink-0 px-3 text-[11px]"
            aria-label={`打开原文：${item.title}`}
          >
            原文
            <ExternalIcon />
          </a>
        ) : null}
      </div>
    </article>
  );
}

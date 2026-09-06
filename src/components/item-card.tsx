import { ExternalLink, Flame, Radio } from "lucide-react";

import { TOPIC_DEFS, sectionMeta, type UnifiedItem } from "@/types/schema";

interface ItemCardProps {
  item: UnifiedItem;
  rank?: number;
}

function topicName(slug: string): string {
  return TOPIC_DEFS.find((topic) => topic.slug === slug)?.name ?? slug;
}

export function ItemCard({ item, rank }: ItemCardProps) {
  const meta = sectionMeta(item.section);

  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-center gap-2">
        {rank !== undefined && (
          <span className="font-mono text-[22px] font-extrabold leading-none gradient-text">
            {String(rank).padStart(2, "0")}
          </span>
        )}
        <span className="chip">{item.sourceName}</span>
        {item.crossSourceCount > 1 && (
          <span
            className="chip"
            style={{ color: "var(--color-ok)", borderColor: "rgba(34,197,94,0.4)", background: "rgba(34,197,94,0.08)" }}
          >
            <Radio className="h-3 w-3" />
            跨源 ×{item.crossSourceCount}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1 font-mono text-[14px] font-bold text-[var(--color-brand-1)]">
          <Flame className="h-3.5 w-3.5" />
          {item.heatScore.toFixed(0)}
        </span>
      </div>

      <h3 className="mt-3.5 line-clamp-3 text-[16px] font-bold leading-snug tracking-[-0.01em]">
        {item.title}
      </h3>

      <p className="mt-2.5 line-clamp-3 text-[13.5px] leading-relaxed text-[var(--color-ink-2)]">
        {item.summary}
      </p>

      {item.topics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.topics.map((topic) => (
            <span key={topic} className="chip !px-2.5 !py-1 !text-[11px]">
              {topicName(topic)}
            </span>
          ))}
        </div>
      )}

      <p className="mt-3.5 text-[12.5px] leading-relaxed text-[var(--color-ink-3)]">
        <span className="font-semibold text-[var(--color-ink-2)]">为什么重要：</span>
        {item.whyItMatters}
      </p>

      <div className="mt-4">
        <div className="heat-track">
          <div className="heat-fill" style={{ width: `${Math.min(100, item.heatScore)}%` }} />
        </div>
      </div>

      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 self-start text-[13.5px] font-semibold text-[var(--color-brand-1)] transition-all duration-200 hover:gap-2.5"
        aria-label={`阅读原文：${item.title}`}
      >
        阅读原文
        <ExternalLink className="h-3.5 w-3.5" />
      </a>

      <span className="sr-only">{meta.label}</span>
    </article>
  );
}

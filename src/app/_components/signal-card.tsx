import Link from "next/link";
import type { SignalItem } from "@/interfaces/issue";
import { ScoreMeter } from "@/app/_components/score-meter";
import { getCategoryName } from "@/lib/issues";

type SignalCardProps = {
  item: SignalItem;
  /** "compact" for homepage list, "detailed" for daily page */
  variant?: "compact" | "detailed";
};

const metricLabels = [
  ["utility", "实用"],
  ["novelty", "增量"],
  ["impact", "影响"],
  ["credibility", "可信"],
  ["audience", "契合"],
  ["freshness", "新鲜"],
] as const;

export function SignalCard({ item, variant = "compact" }: SignalCardProps) {
  const isDetailed = variant === "detailed";
  const time = new Date(item.publishedAt).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="border-b border-neutral-200 py-5">
      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs font-medium text-neutral-400">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-neutral-950 text-[10px] font-semibold text-white">
          {String(item.rank).padStart(2, "0")}
        </span>
        <span className="rounded bg-neutral-100 px-2 py-0.5 text-neutral-600">
          {item.source}
        </span>
        <span>{time}</span>
        <span className="rounded bg-neutral-50 px-2 py-0.5 text-neutral-500">
          {getCategoryName(item.category)}
        </span>
      </div>

      {/* Title */}
      <h2 className="mt-3 text-lg font-semibold leading-snug text-neutral-950">
        {item.sourceUrl ? (
          <Link href={item.sourceUrl} target="_blank" className="hover:text-neutral-600 transition">
            {item.title}
          </Link>
        ) : (
          item.title
        )}
      </h2>

      {/* Summary */}
      <p className="mt-2 text-sm leading-6 text-neutral-600 line-clamp-2">
        {item.summary}
      </p>

      {/* whyItMatters – detailed only */}
      {isDetailed && (
        <p className="mt-3 border-l-2 border-emerald-500 pl-3 text-sm leading-6 text-neutral-700">
          {item.whyItMatters}
        </p>
      )}

      {/* Tags + score row */}
      <div className="mt-3 flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-sm bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-lg font-semibold text-neutral-950">{item.score}</span>
          <div className="w-16">
            <ScoreMeter score={item.score} />
          </div>
        </div>
      </div>

      {/* Metrics – detailed only */}
      {isDetailed && (
        <div className="mt-4 grid grid-cols-3 gap-x-4 gap-y-2 sm:grid-cols-6">
          {metricLabels.map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-2 text-xs">
              <span className="text-neutral-400">{label}</span>
              <span className="font-semibold text-neutral-700">{item.metrics[key]}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

import Link from "next/link";
import type { SignalItem } from "@/interfaces/issue";
import { ScoreMeter } from "@/app/_components/score-meter";
import { ShareLinkButton } from "@/app/_components/share-link-button";
import { SITE_URL } from "@/lib/constants";
import { getCategoryName } from "@/lib/issues";

type SignalCardProps = {
  item: SignalItem;
  issueDate?: string;
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

export function SignalCard({ item, issueDate, variant = "compact" }: SignalCardProps) {
  const isDetailed = variant === "detailed";
  const anchorId = `signal-${item.rank}`;
  const shareUrl = issueDate ? `${SITE_URL}/daily/${issueDate}#${anchorId}` : `#${anchorId}`;
  const correctionUrl = issueDate
    ? `/contact?type=correction&date=${encodeURIComponent(issueDate)}&signal=${item.rank}&title=${encodeURIComponent(item.title)}`
    : "/contact";
  const time = new Date(item.publishedAt).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article
      id={anchorId}
      className="editorial-card group scroll-mt-24 overflow-hidden rounded-md transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_24px_60px_rgba(38,38,38,0.09)]"
    >
      <div className="grid gap-px bg-neutral-200/80 lg:grid-cols-[86px_minmax(0,1fr)_168px]">
        <div className="flex bg-white/95 p-4 lg:flex-col lg:items-start">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-neutral-950 text-sm font-semibold text-white">
            {String(item.rank).padStart(2, "0")}
          </span>
          <div className="ml-3 min-w-0 lg:ml-0 lg:mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Signal</p>
            <p className="mt-1 text-sm font-semibold text-neutral-900">{getCategoryName(item.category)}</p>
          </div>
        </div>

        <div className="min-w-0 bg-white/95 p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-500">
            <span className="rounded-md bg-neutral-100 px-2 py-1 text-neutral-700">{item.source}</span>
            <span>{time}</span>
            <span className="hidden h-px w-8 bg-neutral-200 sm:block" />
            {issueDate ? (
              <Link href={`/daily/${issueDate}#${anchorId}`} className="text-neutral-500 transition hover:text-neutral-950">
                定位
              </Link>
            ) : null}
          </div>

          <h2 className="mt-3 text-balance text-xl font-semibold leading-8 tracking-tight text-neutral-950 sm:text-2xl">
            {item.sourceUrl ? (
              <Link href={item.sourceUrl} target="_blank" rel="noreferrer" className="transition hover:text-emerald-800">
                {item.title}
              </Link>
            ) : (
              item.title
            )}
          </h2>

          <p className={`mt-3 text-sm leading-6 text-neutral-600 ${isDetailed ? "" : "line-clamp-3"}`}>{item.summary}</p>

          <div className="mt-4 rounded-md border-l-4 border-emerald-600 bg-emerald-50/80 px-4 py-3 text-sm leading-6 text-emerald-950">
            {item.whyItMatters}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Link
                key={tag}
                href={`/?tag=${encodeURIComponent(tag)}`}
                className="rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-neutral-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
              >
                {tag}
              </Link>
            ))}
          </div>

          {isDetailed ? (
            <div className="mt-5 grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
              {metricLabels.map(([key, label]) => (
                <div key={key} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-[11px] font-semibold text-neutral-400">{label}</p>
                  <p className="mt-1 text-lg font-semibold text-neutral-950">{item.metrics[key]}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="bg-[#f7f8f2] p-4">
          <div className="flex items-end justify-between gap-3 lg:block">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Worth</p>
              <p className="mt-2 text-4xl font-semibold leading-none tracking-tight text-neutral-950">{item.score}</p>
            </div>
            <div className="w-28 lg:mt-4 lg:w-full">
              <ScoreMeter score={item.score} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-md border border-neutral-200 bg-neutral-200 text-center text-xs lg:grid-cols-1 lg:text-left">
            {metricLabels.slice(0, 3).map(([key, label]) => (
              <div key={key} className="bg-white/80 p-2 lg:flex lg:items-center lg:justify-between">
                <span className="text-neutral-400">{label}</span>
                <span className="font-semibold text-neutral-800">{item.metrics[key]}</span>
              </div>
            ))}
          </div>

          {item.sourceUrl ? (
            <Link
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex h-10 items-center justify-center rounded-md bg-neutral-950 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              阅读原文
            </Link>
          ) : (
            <span className="mt-4 flex h-10 items-center justify-center rounded-md border border-neutral-200 bg-white text-sm font-semibold text-neutral-400">
              暂无原文
            </span>
          )}
          <div className="mt-2">
            <ShareLinkButton url={shareUrl} />
          </div>
          <Link
            href={correctionUrl}
            className="mt-2 flex h-10 items-center justify-center rounded-md border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
          >
            纠错
          </Link>
        </div>
      </div>
    </article>
  );
}

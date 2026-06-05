import Link from "next/link";
import type { SignalItem } from "@/interfaces/issue";
import { ShareLinkButton } from "@/app/_components/share-link-button";
import { ScoreMeter } from "@/app/_components/score-meter";
import { SITE_URL } from "@/lib/constants";
import { getCategoryName } from "@/lib/issues";

type SignalCardProps = {
  item: SignalItem;
  issueDate?: string;
};

const metricLabels = [
  ["utility", "实用"],
  ["novelty", "增量"],
  ["impact", "影响"],
  ["credibility", "可信"],
  ["audience", "契合"],
  ["freshness", "新鲜"],
] as const;

export function SignalCard({ item, issueDate }: SignalCardProps) {
  const anchorId = `signal-${item.rank}`;
  const canonicalUrl = issueDate ? `${SITE_URL}/daily/${issueDate}#${anchorId}` : `#${anchorId}`;

  return (
    <article
      id={anchorId}
      className="group scroll-mt-24 overflow-hidden rounded-md border border-neutral-200 bg-white shadow-sm transition hover:border-neutral-400 hover:shadow-md"
    >
      <div className="grid gap-px bg-neutral-200 lg:grid-cols-[88px_1fr_160px]">
        <div className="bg-white p-4">
          <span className="grid h-12 w-12 place-items-center rounded-md bg-neutral-950 text-sm font-semibold text-white">
            {String(item.rank).padStart(2, "0")}
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Signal</p>
          <p className="mt-1 text-sm font-semibold text-neutral-800">{getCategoryName(item.category)}</p>
        </div>

        <div className="min-w-0 bg-white p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-500">
            <span className="rounded bg-neutral-100 px-2 py-1 text-neutral-700">{item.source}</span>
            <span>{new Date(item.publishedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <h2 className="mt-3 text-balance text-xl font-semibold leading-8 text-neutral-950 group-hover:text-neutral-700">
            {item.title}
          </h2>
          <p className="mt-3 text-base leading-7 text-neutral-700">{item.summary}</p>
          <p className="mt-4 border-l-2 border-emerald-500 pl-3 text-sm leading-6 text-neutral-700">
            {item.whyItMatters}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Link
                key={tag}
                href={`/?tag=${encodeURIComponent(tag)}`}
                className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 transition hover:bg-neutral-200"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-[#f7f8f6] p-4">
          <div className="flex items-end justify-between">
            <span className="text-sm font-medium text-neutral-500">Worth</span>
            <span className="text-4xl font-semibold text-neutral-950">{item.score}</span>
          </div>
          <div className="mt-3">
            <ScoreMeter score={item.score} />
          </div>
          <div className="mt-4 space-y-2">
            {metricLabels.map(([key, label]) => (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">{label}</span>
                <span className="font-semibold text-neutral-800">{item.metrics[key]}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <ShareLinkButton url={canonicalUrl} />
            {issueDate ? (
              <Link
                href={`/daily/${issueDate}#${anchorId}`}
                className="flex h-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50"
              >
                定位
              </Link>
            ) : null}
          </div>
          {item.sourceUrl ? (
            <Link
              href={item.sourceUrl}
              className="mt-2 flex h-9 items-center justify-center rounded-md bg-neutral-950 text-sm font-semibold text-white transition hover:bg-neutral-800"
              target="_blank"
              rel="noreferrer"
            >
              原文
            </Link>
          ) : (
            <span className="mt-2 flex h-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-sm font-semibold text-neutral-400">
              来源待接入
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

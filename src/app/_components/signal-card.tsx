import Link from "next/link";
import type { SignalItem } from "@/interfaces/issue";
import { categoryNames } from "@/lib/categories";
import type { Locale } from "@/i18n/config";

type SignalCardProps = {
  item: SignalItem;
  issueDate?: string;
  variant?: "compact" | "detailed";
  locale?: Locale;
};

function padRank(rank: number): string {
  return String(rank).padStart(3, "0");
}

export function SignalCard({ item, issueDate, variant = "compact" }: SignalCardProps) {
  const isDetailed = variant === "detailed";
  const categoryName = categoryNames[item.category] || item.category;
  const primaryTag = item.tags[0];
  const restTags = item.tags.slice(1);

  return (
    <article
      className="group"
      style={{
        borderBottom: "0.8px solid var(--line)",
        paddingBottom: "32px",
        marginBottom: "32px",
      }}
    >
      {/* NO. xxx + accent bar */}
      <div className="flex items-center gap-3" style={{ marginBottom: "12px" }}>
        <span
          className="font-mono-ui"
          style={{
            fontSize: "13px",
            fontWeight: 300,
            letterSpacing: "1.3px",
            color: "var(--muted)",
          }}
        >
          NO. {padRank(item.rank)}
        </span>
        <div className="accent-bar" />
      </div>

      {/* Title */}
      <h2 className="editorial-title" style={{ fontSize: "22px", lineHeight: 1.35 }}>
        {item.sourceUrl ? (
          <Link
            href={item.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover-accent"
            style={{ color: "inherit" }}
          >
            {item.title}
          </Link>
        ) : (
          item.title
        )}
      </h2>

      {/* Summary */}
      <p
        className="font-serif-cn mt-2 line-clamp-2"
        style={{
          fontSize: "14px",
          fontWeight: 400,
          lineHeight: 1.7,
          color: "rgba(26,22,18,0.65)",
        }}
      >
        {item.summary}
      </p>

      {/* Why it matters — detailed only */}
      {isDetailed && item.whyItMatters && (
        <div
          className="mt-3 px-3.5 py-2.5"
          style={{ borderLeft: "3px solid var(--accent)", background: "var(--surface)" }}
        >
          <p className="mono-label" style={{ fontSize: "10px", marginBottom: "4px" }}>
            WHY IT MATTERS
          </p>
          <p className="font-serif-cn" style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--ink-soft)" }}>
            {item.whyItMatters}
          </p>
        </div>
      )}

      {/* Meta row: tags + source + score */}
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        {/* Primary tag — accent */}
        <Link
          href={`/?tag=${encodeURIComponent(primaryTag)}`}
          className="tag-chip tag-accent"
        >
          {primaryTag}
        </Link>

        {/* Rest tags — muted */}
        {restTags.map((tag) => (
          <Link
            key={tag}
            href={`/?tag=${encodeURIComponent(tag)}`}
            className="tag-chip tag-muted"
          >
            {tag}
          </Link>
        ))}

        {/* Source */}
        <span
          className="font-mono-ui ml-auto"
          style={{
            fontSize: "9px",
            letterSpacing: "1.6px",
            textTransform: "uppercase",
            background: "var(--tag-bg)",
            padding: "2px 6px",
            color: "var(--ink-soft)",
          }}
        >
          {item.source}
        </span>

        {/* Score */}
        <span
          className="font-mono-ui"
          style={{
            fontSize: "15px",
            fontWeight: 500,
            color: "var(--ink)",
            letterSpacing: "-0.5px",
            minWidth: "28px",
            textAlign: "right",
          }}
        >
          {item.score}
        </span>
      </div>

      {/* Actions — detailed only */}
      {isDetailed && (
        <div className="mt-3 flex items-center gap-2 pt-3" style={{ borderTop: "0.8px solid var(--line)" }}>
          {item.sourceUrl ? (
            <Link href={item.sourceUrl} target="_blank" rel="noreferrer" className="btn-primary h-8 text-[11px]">
              ORIGINAL
            </Link>
          ) : null}
          <Link
            href={issueDate ? `/contact?type=correction&date=${encodeURIComponent(issueDate)}&signal=${item.rank}&title=${encodeURIComponent(item.title)}` : "/contact"}
            className="btn-secondary h-8 text-[11px]"
          >
            CORRECTION
          </Link>
        </div>
      )}
    </article>
  );
}

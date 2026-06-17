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

export function SignalCard({ item, issueDate, variant = "compact" }: SignalCardProps) {
  const isDetailed = variant === "detailed";
  const categoryName = categoryNames[item.category] || item.category;

  return (
    <article
      className="group"
      style={{
        borderBottom: "0.5px solid var(--line)",
        paddingBottom: "20px",
        marginBottom: "20px",
      }}
    >
      {/* Top row: category pill + score */}
      <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
        <span
          className="tag-chip"
          style={{
            background: "var(--accent-light)",
            color: "var(--accent)",
            fontSize: "11px",
          }}
        >
          {categoryName}
        </span>
        <span
          className="font-mono-ui"
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "var(--ink)",
            letterSpacing: "-0.5px",
            lineHeight: 1,
          }}
        >
          {item.score}
        </span>
      </div>

      {/* Title */}
      <h2
        className="editorial-title line-clamp-2"
        style={{ fontSize: "18px", lineHeight: 1.35 }}
      >
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
        className="mt-1.5 line-clamp-2"
        style={{
          fontSize: "14px",
          fontWeight: 400,
          lineHeight: 1.65,
          color: "var(--muted)",
        }}
      >
        {item.summary}
      </p>

      {/* Why it matters - detailed only */}
      {isDetailed && item.whyItMatters && (
        <div
          className="mt-3 px-3.5 py-2.5"
          style={{ borderLeft: "2px solid var(--accent)", background: "var(--surface)" }}
        >
          <p className="section-kicker" style={{ fontSize: "10px", marginBottom: "4px" }}>
            WHY IT MATTERS
          </p>
          <p style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--ink-soft)" }}>
            {item.whyItMatters}
          </p>
        </div>
      )}

      {/* Meta row: source + tags */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        {/* Source */}
        <span
          className="font-mono-ui"
          style={{
            fontSize: "11px",
            letterSpacing: "0.3px",
            color: "var(--muted)",
          }}
        >
          {item.source}
        </span>

        {/* Tags */}
        {item.tags.map((tag) => (
          <Link
            key={tag}
            href={`/?tag=${encodeURIComponent(tag)}`}
            className="tag-chip"
          >
            {tag}
          </Link>
        ))}
      </div>

      {/* Actions - detailed only */}
      {isDetailed && (
        <div className="mt-3 flex items-center gap-2 pt-3" style={{ borderTop: "0.5px solid var(--line)" }}>
          {item.sourceUrl ? (
            <Link href={item.sourceUrl} target="_blank" rel="noreferrer" className="btn-primary h-8 text-[12px]">
              ORIGINAL
            </Link>
          ) : null}
          <Link
            href={issueDate ? `/contact?type=correction&date=${encodeURIComponent(issueDate)}&signal=${item.rank}&title=${encodeURIComponent(item.title)}` : "/contact"}
            className="btn-secondary h-8 text-[12px]"
          >
            CORRECTION
          </Link>
        </div>
      )}
    </article>
  );
}

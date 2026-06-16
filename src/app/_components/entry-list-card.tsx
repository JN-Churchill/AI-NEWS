import Link from "next/link";
import type { SignalEntry } from "@/lib/catalog";
import { categoryNames } from "@/lib/categories";

type EntryListCardProps = {
  item: SignalEntry;
};

export function EntryListCard({ item }: EntryListCardProps) {
  return (
    <article className="surface-panel card-hover group p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/daily/${item.issueDate}#signal-${item.rank}`}
          className="inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold"
          style={{ background: "var(--ink)", color: "white" }}
        >
          {item.issueDate}
        </Link>
        <Link
          href={`/topics/${item.category}`}
          className="tag-chip"
        >
          {categoryNames[item.category] || item.category}
        </Link>
        <span className="tag-chip">{item.source}</span>
      </div>
      <h2
        className="font-editorial mt-3 text-[1.15rem] font-normal leading-[1.2] tracking-[-0.01em]"
        style={{ color: "var(--ink)" }}
      >
        <Link
          href={`/daily/${item.issueDate}#signal-${item.rank}`}
          className="hover-underline transition-colors"
          style={{ color: "inherit" }}
        >
          {item.title}
        </Link>
      </h2>
      <p className="mt-2 line-clamp-2 text-[13px] leading-[1.6]" style={{ color: "var(--muted)" }}>
        {item.summary}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {item.tags.map((tag) => (
          <Link
            key={tag}
            href={`/search?q=${encodeURIComponent(tag)}`}
            className="tag-chip"
          >
            {tag}
          </Link>
        ))}
      </div>
    </article>
  );
}

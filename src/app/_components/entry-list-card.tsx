import Link from "next/link";
import type { SignalEntry } from "@/lib/catalog";
import { getCategoryName } from "@/lib/issues";

type EntryListCardProps = {
  item: SignalEntry;
};

export function EntryListCard({ item }: EntryListCardProps) {
  return (
    <article className="editorial-card group rounded-md p-5 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_20px_48px_rgba(38,38,38,0.08)]">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-500">
        <Link href={`/daily/${item.issueDate}#signal-${item.rank}`} className="rounded-md bg-neutral-950 px-2 py-1 text-white">
          {item.issueDate}
        </Link>
        <Link href={`/topics/${item.category}`} className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-800 hover:bg-emerald-100">
          {getCategoryName(item.category)}
        </Link>
        <span className="rounded-md bg-neutral-100 px-2 py-1 text-neutral-600">{item.source}</span>
      </div>
      <h2 className="mt-4 text-xl font-semibold leading-8 tracking-tight text-neutral-950">
        <Link href={`/daily/${item.issueDate}#signal-${item.rank}`} className="transition group-hover:text-emerald-800">
          {item.title}
        </Link>
      </h2>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600">{item.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <Link
            key={tag}
            href={`/search?q=${encodeURIComponent(tag)}`}
            className="rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-semibold text-neutral-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
          >
            {tag}
          </Link>
        ))}
      </div>
    </article>
  );
}

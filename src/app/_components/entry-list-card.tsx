import Link from "next/link";
import type { SignalEntry } from "@/lib/catalog";
import { getCategoryName } from "@/lib/issues";

type EntryListCardProps = {
  item: SignalEntry;
};

export function EntryListCard({ item }: EntryListCardProps) {
  return (
    <article className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-400">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-500">
        <Link href={`/daily/${item.issueDate}#signal-${item.rank}`} className="rounded bg-neutral-100 px-2 py-1 text-neutral-700 hover:bg-neutral-200">
          {item.issueDate}
        </Link>
        <Link href={`/topics/${item.category}`} className="rounded bg-emerald-50 px-2 py-1 text-emerald-800 hover:bg-emerald-100">
          {getCategoryName(item.category)}
        </Link>
        <span>{item.source}</span>
      </div>
      <h2 className="mt-3 text-xl font-semibold leading-8 text-neutral-950">
        <Link href={`/daily/${item.issueDate}#signal-${item.rank}`} className="hover:text-neutral-700">
          {item.title}
        </Link>
      </h2>
      <p className="mt-3 text-sm leading-6 text-neutral-600">{item.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <Link
            key={tag}
            href={`/search?q=${encodeURIComponent(tag)}`}
            className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-200"
          >
            {tag}
          </Link>
        ))}
      </div>
    </article>
  );
}

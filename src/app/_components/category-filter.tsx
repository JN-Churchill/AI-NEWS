import Link from "next/link";
import type { IssueCategory } from "@/interfaces/issue";

type CategoryFilterProps = {
  categories: IssueCategory[];
  activeCategory: string;
};

export function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  const items = [{ slug: "all", name: "全部", count: 0, score: 0 }, ...categories];

  return (
    <div className="flex gap-1 overflow-x-auto rounded-md border border-neutral-200 bg-white p-1 shadow-sm">
      {items.map((category) => {
        const active = activeCategory === category.slug;
        const href = category.slug === "all" ? "/" : `/?category=${category.slug}`;

        return (
          <Link
            key={category.slug}
            href={href}
            className={`flex h-10 shrink-0 items-center justify-center rounded px-3 text-sm font-semibold transition ${
              active
                ? "bg-neutral-950 text-white"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
            }`}
          >
            {category.name}
            {category.count > 0 && <span className="ml-2 text-xs opacity-70">{category.count}</span>}
          </Link>
        );
      })}
    </div>
  );
}

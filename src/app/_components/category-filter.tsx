import Link from "next/link";
import type { IssueCategory } from "@/interfaces/issue";

type CategoryFilterProps = {
  categories: IssueCategory[];
  activeCategory?: string;
  activeCategories?: string[];
  activeTag?: string;
};

function buildHref(slug: string, activeCategories: string[], activeTag?: string) {
  const params = new URLSearchParams();
  const current = new Set(activeCategories);

  if (slug === "all") {
    current.clear();
  } else if (current.has(slug)) {
    current.delete(slug);
  } else {
    current.add(slug);
  }

  if (current.size > 0) {
    params.set("category", Array.from(current).join(","));
  }

  if (activeTag) {
    params.set("tag", activeTag);
  }

  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export function CategoryFilter({ categories, activeCategory, activeCategories, activeTag }: CategoryFilterProps) {
  const selected = activeCategories ?? (activeCategory && activeCategory !== "all" ? [activeCategory] : []);
  const items = [{ slug: "all", name: "全部", count: 0, score: 0 }, ...categories];

  return (
    <div className="flex gap-1 overflow-x-auto rounded-md border border-neutral-200 bg-white p-1 shadow-sm">
      {items.map((category) => {
        const active = category.slug === "all" ? selected.length === 0 : selected.includes(category.slug);
        const href = buildHref(category.slug, selected, activeTag);

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

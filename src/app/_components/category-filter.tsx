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
    <nav className="flex items-center gap-2 overflow-x-auto rounded-md border border-neutral-200 bg-white/80 p-1 shadow-sm">
      {items.map((category) => {
        const active = category.slug === "all" ? selected.length === 0 : selected.includes(category.slug);
        const href = buildHref(category.slug, selected, activeTag);

        return (
          <Link
            key={category.slug}
            href={href}
            className={`flex h-10 shrink-0 items-center rounded px-3 text-sm font-semibold transition ${
              active
                ? "bg-neutral-950 text-white shadow-sm"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            }`}
          >
            {category.name}
            {category.count > 0 && (
              <span className={`ml-2 text-xs ${active ? "text-white/65" : "text-neutral-400"}`}>{category.count}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

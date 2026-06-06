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
    <nav className="flex items-center gap-1 border-b border-neutral-200 pb-0">
      {items.map((category) => {
        const active = category.slug === "all" ? selected.length === 0 : selected.includes(category.slug);
        const href = buildHref(category.slug, selected, activeTag);

        return (
          <Link
            key={category.slug}
            href={href}
            className={`shrink-0 border-b-2 px-3 pb-2 pt-1 text-sm font-medium transition ${
              active
                ? "border-neutral-950 text-neutral-950"
                : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-800"
            }`}
          >
            {category.name}
            {category.count > 0 && (
              <span className="ml-1 text-xs text-neutral-400">{category.count}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

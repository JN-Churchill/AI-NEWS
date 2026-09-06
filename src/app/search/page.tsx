import { SearchClient } from "@/components/search-client";
import { getAllIssues } from "@/lib/content";
import type { SearchEntry } from "@/types/schema";

export const metadata = {
  title: "搜索",
  description: "在全站历史日报中搜索标题、摘要与来源，支持按版块与主题筛选。",
};

export default function SearchPage() {
  const entries: SearchEntry[] = getAllIssues().flatMap((issue) =>
    issue.sections.flatMap((section) =>
      section.items.map((item) => ({
        id: item.id,
        date: issue.date,
        title: item.title,
        summary: item.summary,
        url: item.url,
        sourceName: item.sourceName,
        section: item.section,
        topics: item.topics,
        heatScore: item.heatScore,
      })),
    ),
  );

  return (
    <div className="pb-4">
      <section className="pt-8">
        <h1 className="text-[clamp(26px,4.4vw,38px)] font-extrabold leading-tight tracking-[-0.02em]">
          全站<span className="gradient-text">搜索</span>
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--color-ink-2)]">
          在 {entries.length} 条历史热点中检索，支持按版块与主题组合筛选，输入即时过滤。
        </p>
      </section>

      <div className="mt-8">
        <SearchClient entries={entries} />
      </div>
    </div>
  );
}

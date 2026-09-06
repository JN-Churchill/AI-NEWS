"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { SECTION_DEFS, TOPIC_DEFS, sectionMeta, type SearchEntry, type SectionSlug } from "@/types/schema";

function topicName(slug: string): string {
  return TOPIC_DEFS.find((topic) => topic.slug === slug)?.name ?? slug;
}

interface SearchClientProps {
  entries: SearchEntry[];
}

export function SearchClient({ entries }: SearchClientProps) {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<SectionSlug | "all">("all");
  const [topic, setTopic] = useState<string>("all");

  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    for (const entry of entries) {
      for (const item of entry.topics) set.add(item);
    }
    return [...set];
  }, [entries]);

  const results = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return entries
      .filter((entry) => {
        if (section !== "all" && entry.section !== section) return false;
        if (topic !== "all" && !entry.topics.includes(topic)) return false;
        if (!keyword) return true;
        return (
          entry.title.toLowerCase().includes(keyword) ||
          entry.summary.toLowerCase().includes(keyword) ||
          entry.sourceName.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => b.heatScore - a.heatScore);
  }, [entries, query, section, topic]);

  const hasFilter = query !== "" || section !== "all" || topic !== "all";

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-3)]" />
        <input
          className="input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索标题、摘要或来源，例如：开源模型、融资、Agent"
          aria-label="搜索日报条目"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-[12.5px] text-[var(--color-ink-3)]">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          版块
        </span>
        <button
          type="button"
          onClick={() => setSection("all")}
          className={`chip ${section === "all" ? "chip-active" : ""}`}
        >
          全部
        </button>
        {SECTION_DEFS.map((definition) => (
          <button
            key={definition.slug}
            type="button"
            onClick={() => setSection(definition.slug)}
            className={`chip ${section === definition.slug ? "chip-active" : ""}`}
          >
            {definition.short}
          </button>
        ))}
      </div>

      {availableTopics.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] text-[var(--color-ink-3)]">主题</span>
          <button
            type="button"
            onClick={() => setTopic("all")}
            className={`chip ${topic === "all" ? "chip-active" : ""}`}
          >
            全部
          </button>
          {availableTopics.map((slug) => (
            <button
              key={slug}
              type="button"
              onClick={() => setTopic(slug)}
              className={`chip ${topic === slug ? "chip-active" : ""}`}
            >
              {topicName(slug)}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between text-[13px] text-[var(--color-ink-3)]">
        <span>
          共 <strong className="font-mono text-[15px] text-[var(--color-ink-1)]">{results.length}</strong> 条结果
        </span>
        {hasFilter && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSection("all");
              setTopic("all");
            }}
            className="inline-flex items-center gap-1 transition-colors hover:text-[var(--color-brand-1)]"
          >
            <X className="h-3.5 w-3.5" />
            清除筛选
          </button>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {results.length === 0 && (
          <div className="glass p-10 text-center text-[14px] text-[var(--color-ink-2)]">
            没有匹配的结果，试试更换关键词或清除筛选条件。
          </div>
        )}

        {results.map((entry) => (
          <a
            key={`${entry.date}-${entry.id}`}
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card p-5"
          >
            <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--color-ink-3)]">
              <span className="font-mono">{entry.date}</span>
              <span className="chip !px-2.5 !py-0.5 !text-[11px]">{sectionMeta(entry.section).label}</span>
              <span>{entry.sourceName}</span>
              <span className="ml-auto font-mono text-[13px] font-bold text-[var(--color-brand-1)]">
                {entry.heatScore.toFixed(0)}
              </span>
            </div>
            <h3 className="mt-2.5 line-clamp-2 text-[15.5px] font-bold leading-snug">{entry.title}</h3>
            <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-[var(--color-ink-2)]">
              {entry.summary}
            </p>
            {entry.topics.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {entry.topics.map((slug) => (
                  <span key={slug} className="chip !px-2.5 !py-1 !text-[11px]">
                    {topicName(slug)}
                  </span>
                ))}
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

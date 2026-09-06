"use client";

import { useEffect, useState } from "react";

export interface AihotAnchorSection {
  id: string;
  label: string;
  count: number;
  color: string;
}

/**
 * 粘性锚点导航：滚动时同步高亮当前版块。
 * props 由 server 组件在 build 期算好传入，客户端只做滚动监听。
 */
export function AihotAnchorNav({ sections }: { sections: AihotAnchorSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const onScroll = () => {
      let current = sections[0]?.id ?? "";
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= 120) {
          current = section.id;
        }
      }
      setActiveId(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  if (sections.length === 0) {
    return null;
  }

  return (
    <nav className="masthead-bar sticky top-14 z-30" aria-label="日报版块导航">
      <div className="mx-auto flex max-w-[960px] items-center gap-1.5 overflow-x-auto px-5 py-2 sm:px-6">
        {sections.map((section) => {
          const active = section.id === activeId;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-current={active ? "true" : undefined}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition-colors"
              style={{
                background: active ? "var(--surface)" : "transparent",
                border: `0.5px solid ${active ? "var(--line-heavy)" : "transparent"}`,
                color: active ? "var(--ink)" : "var(--muted)",
                fontWeight: active ? 500 : 400,
              }}
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: section.color }} aria-hidden="true" />
              {section.label}
              <span className="font-mono text-[10px]" style={{ color: "var(--muted)" }}>
                {section.count}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

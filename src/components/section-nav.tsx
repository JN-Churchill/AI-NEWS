"use client";

import { useEffect, useState } from "react";

export interface NavSection {
  slug: string;
  short: string;
  count: number;
}

/** 版块锚点导航：吸顶 + 滚动自动高亮当前版块 */
export function SectionNav({ sections }: { sections: NavSection[] }) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );

    for (const section of sections) {
      const element = document.getElementById(section.slug);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [sections]);

  if (sections.length === 0) return null;

  return (
    <nav
      className="sticky top-[60px] z-40 mt-9 border-y border-white/8 py-2.5"
      style={{ background: "rgba(10,11,18,0.82)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
      aria-label="版块导航"
    >
      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((section) => (
          <a
            key={section.slug}
            href={`#${section.slug}`}
            className={`chip shrink-0 ${active === section.slug ? "chip-active" : ""}`}
          >
            {section.short}
            <span className="font-mono text-[11px] opacity-70">{section.count}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

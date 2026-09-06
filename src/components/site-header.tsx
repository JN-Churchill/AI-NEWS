"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Rss, Sparkles } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "今日" },
  { href: "/archive", label: "归档" },
  { href: "/search", label: "搜索" },
  { href: "/topics", label: "主题" },
  { href: "/about", label: "评分方法" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(10,11,18,0.82)" : "rgba(10,11,18,0.35)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: `1px solid ${scrolled ? "rgba(148,163,184,0.18)" : "transparent"}`,
      }}
    >
      <div className="mx-auto flex h-[60px] w-full max-w-[1180px] items-center gap-4 px-5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-1)] to-[var(--color-brand-3)]">
            <Sparkles className="h-4 w-4 text-[#05121a]" strokeWidth={2.5} />
          </span>
          <span className="text-[15px] font-extrabold tracking-tight">
            AI<span className="gradient-text"> 日报</span>
          </span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-[rgba(34,211,238,0.12)] text-[var(--color-brand-1)]"
                    : "text-[var(--color-ink-2)] hover:bg-white/5 hover:text-[var(--color-ink-1)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <a
          href="/rss.xml"
          className="btn btn-ghost hidden shrink-0 !px-3.5 !py-2 sm:inline-flex"
          aria-label="订阅 RSS"
        >
          <Rss className="h-3.5 w-3.5" />
          <span className="text-[13px]">订阅</span>
        </a>
      </div>
    </header>
  );
}

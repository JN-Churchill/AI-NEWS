"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_NAME } from "@/lib/constants";

const navItems = [
  { href: "/", label: "今日" },
  { href: "/topics", label: "主题" },
  { href: "/sources", label: "来源" },
  { href: "/archive", label: "归档" },
  { href: "/search", label: "搜索" },
  { href: "/subscribe", label: "订阅" },
  { href: "/about", label: "方法" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-[#f6f6f1]/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-[1440px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-neutral-950 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm ring-1 ring-neutral-950/10 transition group-hover:bg-emerald-800">
            IDX
          </span>
          <span>
            <span className="block text-[15px] font-semibold text-neutral-950">{SITE_NAME}</span>
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500 sm:block">
              Daily AI Signal Desk
            </span>
          </span>
        </Link>

        <div className="flex min-w-0 items-center gap-2">
          <nav className="flex min-w-0 items-center overflow-x-auto rounded-md border border-neutral-200/80 bg-white/75 p-1 shadow-sm">
            {navItems.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 rounded px-3 py-1.5 text-sm font-semibold transition ${
                    active ? "bg-neutral-950 text-white shadow-sm" : "text-neutral-600 hover:bg-neutral-950 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Link
            href="/rss.xml"
            className="hidden h-9 items-center rounded-md bg-emerald-700 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 sm:flex"
          >
            RSS
          </Link>
        </div>
      </div>
    </header>
  );
}

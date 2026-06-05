import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

const navItems = [
  { href: "/", label: "今日" },
  { href: "/archive", label: "归档" },
  { href: "/about", label: "方法" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-[#f7f8f6]/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-neutral-950 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            IDX
          </span>
          <span>
            <span className="block text-base font-semibold text-neutral-950">{SITE_NAME}</span>
            <span className="hidden text-xs text-neutral-500 sm:block">Daily AI signal desk</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="flex items-center rounded-md border border-neutral-200 bg-white p-1 shadow-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/rss.xml"
            className="hidden h-9 items-center rounded-md bg-neutral-950 px-3 text-sm font-medium text-white transition hover:bg-neutral-800 sm:flex"
          >
            RSS
          </Link>
        </div>
      </div>
    </header>
  );
}

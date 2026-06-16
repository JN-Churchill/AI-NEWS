"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { SITE_NAME } from "@/lib/constants";
import { useTranslation } from "@/hooks/use-translation";
import { LanguageSwitcher } from "./language-switcher";
import { defaultLocale, type Locale } from "@/i18n/config";
import { categoryNames } from "@/lib/categories";

const navItems = [
  { href: "/", translationKey: "navigation.today" },
  { href: "/topics", translationKey: "navigation.topics" },
  { href: "/archive", translationKey: "navigation.archive" },
  { href: "/about", translationKey: "navigation.method" },
];

const categorySlugs = ["all", "model", "product", "research", "opensource", "business", "infra"];

interface SiteHeaderProps {
  locale?: Locale;
}

function formatDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const vol = `VOL. ${y}.${m}`;
  const dateStr = now.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  });
  return { vol, dateStr };
}

function CategoryTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") ?? "";
  const currentTag = searchParams.get("tag") ?? "";

  // Only show tabs on home page
  if (pathname !== "/") return null;

  return (
    <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
      {categorySlugs.map((slug) => {
        const active = slug === "all"
          ? !currentCategory && !currentTag
          : currentCategory === slug;

        const href = slug === "all" ? "/" : `/?category=${slug}`;
        const label = categoryNames[slug] || slug;

        return (
          <Link
            key={slug}
            href={href}
            className={`nav-tab whitespace-nowrap ${active ? "nav-tab-active" : ""}`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

export function SiteHeader({ locale = defaultLocale }: SiteHeaderProps) {
  const pathname = usePathname();
  const { t } = useTranslation(locale);
  const [menuOpen, setMenuOpen] = useState(false);
  const { vol, dateStr } = formatDate();

  return (
    <header className="sticky top-0 z-40 masthead-bar">
      {/* Row 1: Masthead */}
      <div className="mx-auto flex w-full max-w-[1088px] items-center justify-between px-5 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span
            className="flex h-7 w-7 items-center justify-center text-[10px] font-semibold text-white"
            style={{ background: "var(--ink)", fontFamily: "'DM Mono', monospace" }}
          >
            AI
          </span>
          <span
            className="hidden text-[13px] font-medium tracking-[0.5px] sm:inline"
            style={{ color: "var(--ink)", fontFamily: "'DM Mono', monospace" }}
          >
            {SITE_NAME}
          </span>
        </Link>

        {/* Center: site title */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center hidden md:block">
          <p className="font-mono-ui text-[11px] tracking-[1.5px] uppercase" style={{ color: "var(--muted)" }}>
            {SITE_NAME}
          </p>
          <p className="font-serif-cn text-[13px] font-medium" style={{ color: "var(--ink)" }}>
            每日 AI 简报
          </p>
        </div>

        {/* Right: date + volume */}
        <div className="text-right shrink-0">
          <p className="font-mono-ui text-[11px] tracking-[1px] uppercase" style={{ color: "var(--muted)" }}>
            {vol}
          </p>
          <p className="font-mono-ui text-[11px]" style={{ color: "var(--ink-soft)" }}>
            {dateStr}
          </p>
        </div>
      </div>

      {/* Row 2: Navigation + Category Tabs */}
      <div
        className="mx-auto w-full max-w-[1088px] px-5 sm:px-6"
        style={{ borderTop: "0.8px solid var(--line)" }}
      >
        <div className="flex items-center justify-between gap-4 py-1.5">
          {/* Category tabs (home page only, wrapped in Suspense for useSearchParams) */}
          <Suspense fallback={<div className="flex-1" />}>
            <CategoryTabs />
          </Suspense>

          {/* Desktop nav + actions */}
          <div className="hidden items-center gap-3 md:flex shrink-0">
            {navItems.map((item) => {
              const active = item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="font-mono-ui text-[11px] tracking-[1px] uppercase transition-colors"
                  style={{
                    color: active ? "var(--ink)" : "var(--muted)",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {t(item.translationKey)}
                </Link>
              );
            })}

            <span className="h-3 w-px" style={{ background: "var(--line-heavy)" }} />

            <Link
              href="/search"
              className="font-mono-ui text-[11px] tracking-[1px] uppercase transition-colors"
              style={{ color: "var(--muted)" }}
              aria-label={t("navigation.search")}
            >
              {t("navigation.search")}
            </Link>

            <Link
              href="/subscribe"
              className="btn-primary h-8 px-4"
            >
              {t("navigation.subscribe")}
            </Link>

            <LanguageSwitcher
              currentLocale={locale}
              translations={{
                language: t("common.language"),
                chinese: t("common.chinese"),
                english: t("common.english"),
              }}
            />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 md:hidden"
            style={{ color: "var(--muted)" }}
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          className="px-5 pb-4 pt-2 md:hidden"
          style={{ borderTop: "0.8px solid var(--line)", background: "var(--surface)" }}
        >
          {/* Category tabs in mobile */}
          {pathname === "/" && (
            <div className="flex flex-wrap gap-2 mb-3 pb-3" style={{ borderBottom: "0.8px solid var(--line)" }}>
              {categorySlugs.map((slug) => {
                const href = slug === "all" ? "/" : `/?category=${slug}`;
                const label = categoryNames[slug] || slug;
                return (
                  <Link
                    key={slug}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="font-mono-ui text-[11px] tracking-[1px] uppercase"
                    style={{ color: "var(--muted)" }}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 font-mono-ui text-[12px] tracking-[1px] uppercase"
                style={{
                  color: active ? "var(--ink)" : "var(--muted)",
                  fontWeight: active ? 500 : 400,
                }}
              >
                {t(item.translationKey)}
              </Link>
            );
          })}
          <Link
            href="/search"
            onClick={() => setMenuOpen(false)}
            className="block py-2.5 font-mono-ui text-[12px] tracking-[1px] uppercase"
            style={{ color: "var(--muted)" }}
          >
            {t("navigation.search")}
          </Link>
          <Link
            href="/subscribe"
            onClick={() => setMenuOpen(false)}
            className="btn-primary mt-2 w-full text-center"
          >
            {t("navigation.subscribe")}
          </Link>
        </nav>
      )}
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { LanguageSwitcher } from "./language-switcher";
import { defaultLocale, type Locale } from "@/i18n/config";
import { categoryNames } from "@/lib/categories";

const navItems = [
  { href: "/", translationKey: "navigation.today" },
  { href: "/briefing", translationKey: "navigation.briefing" },
  { href: "/topics", translationKey: "navigation.topics" },
  { href: "/archive", translationKey: "navigation.archive" },
  { href: "/about", translationKey: "navigation.method" },
];

const categorySlugs = ["all", "model", "product", "research", "opensource", "business", "infra"];

interface SiteHeaderProps {
  locale?: Locale;
}

function CategoryPills() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") ?? "";
  const currentTag = searchParams.get("tag") ?? "";

  if (pathname !== "/") return null;

  return (
    <div className="hidden items-center gap-1 md:flex">
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
            className="whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] transition-colors"
            style={{
              color: active ? "var(--ink)" : "var(--muted)",
              fontWeight: active ? 500 : 400,
              background: active ? "var(--surface)" : "transparent",
            }}
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

  return (
    <header className="sticky top-0 z-40 masthead-bar">
      <div className="mx-auto flex h-14 w-full max-w-[960px] items-center gap-4 px-5 sm:px-6">
        {/* Wordmark */}
        <Link
          href="/"
          className="shrink-0 text-[15px] font-semibold tracking-[-0.01em]"
          style={{ color: "var(--ink)" }}
        >
          AI Signal
        </Link>

        {/* Category pills (home page only) */}
        <Suspense fallback={null}>
          <CategoryPills />
        </Suspense>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-4 md:flex">
          {navItems.map((item) => {
            const active = item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="text-[13px] transition-colors"
                style={{
                  color: active ? "var(--ink)" : "var(--muted)",
                  fontWeight: active ? 500 : 400,
                }}
              >
                {t(item.translationKey)}
              </Link>
            );
          })}
        </nav>

        {/* Search icon */}
        <Link
          href="/search"
          className="hidden items-center justify-center md:flex"
          style={{ color: "var(--muted)" }}
          aria-label={t("navigation.search")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </Link>

        {/* Subscribe pill */}
        <Link
          href="/subscribe"
          className="btn-primary hidden h-8 px-3.5 text-[12px] md:inline-flex"
        >
          {t("navigation.subscribe")}
        </Link>

        {/* Language */}
        <LanguageSwitcher
          currentLocale={locale}
          translations={{
            language: t("common.language"),
            chinese: t("common.chinese"),
            english: t("common.english"),
          }}
        />

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

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          className="px-5 pb-4 pt-2 md:hidden"
          style={{ borderTop: "0.5px solid var(--line)", background: "var(--canvas)" }}
        >
          {/* Category pills in mobile */}
          {pathname === "/" && (
            <div className="mb-3 flex flex-wrap gap-1.5 pb-3" style={{ borderBottom: "0.5px solid var(--line)" }}>
              {categorySlugs.map((slug) => {
                const href = slug === "all" ? "/" : `/?category=${slug}`;
                const label = categoryNames[slug] || slug;
                return (
                  <Link
                    key={slug}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-full px-2.5 py-1 text-[12px]"
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
                className="block py-2.5 text-[14px]"
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
            className="block py-2.5 text-[14px]"
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

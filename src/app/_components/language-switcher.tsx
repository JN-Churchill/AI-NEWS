"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { locales, type Locale } from "@/i18n/config";

interface LanguageSwitcherProps {
  currentLocale: Locale;
  translations: {
    language: string;
    chinese: string;
    english: string;
  };
}

export function LanguageSwitcher({ currentLocale, translations }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (locale: Locale) => {
    const segments = pathname.split('/');
    const pathWithoutLocale = segments.length > 2 ? '/' + segments.slice(2).join('/') : '/';
    const newPath = `/${locale}${pathWithoutLocale}`;
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] font-medium transition"
        style={{ color: "var(--muted)" }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-alt)"; e.currentTarget.style.color = "var(--ink)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
        <span>{translations.language}</span>
        <svg
          className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 w-36 rounded-lg py-1"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className="flex w-full items-center px-3 py-2 text-[13px] font-medium transition"
              style={{
                color: locale === currentLocale ? "var(--ink)" : "var(--muted)",
                background: locale === currentLocale ? "var(--surface-alt)" : "transparent",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-alt)"; }}
              onMouseLeave={(e) => {
                if (locale !== currentLocale) e.currentTarget.style.background = "transparent";
              }}
            >
              {locale === 'zh' ? translations.chinese : translations.english}
              {locale === currentLocale && (
                <svg
                  className="ml-auto h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ color: "var(--ink)" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

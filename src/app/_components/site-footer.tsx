"use client";

import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { useTranslation } from "@/hooks/use-translation";
import { defaultLocale, type Locale } from "@/i18n/config";

interface SiteFooterProps {
  locale?: Locale;
}

const footerLinks = [
  { href: "/subscribe", key: "footer.links.subscribe" },
  { href: "/rss.xml", key: "footer.links.rss" },
  { href: "/sources", key: "footer.links.sources" },
  { href: "/about", key: "footer.links.method" },
  { href: "/contact", key: "footer.links.contact" },
];

export function SiteFooter({ locale = defaultLocale }: SiteFooterProps) {
  const { t } = useTranslation(locale);

  return (
    <footer className="border-t" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
      <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-4 px-5 py-8 sm:flex-row sm:items-center sm:px-6">
        <div>
          <p className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>{SITE_NAME}</p>
          <p className="mt-0.5 text-[11px]" style={{ color: "var(--muted)" }}>
            &copy; {new Date().getFullYear()} {t("footer.copyright")}
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-1">
          {footerLinks.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className="footer-link text-[12px] font-medium"
              style={{ color: "var(--muted)" }}
            >
              {t(key)}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

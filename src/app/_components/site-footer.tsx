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
    <footer className="border-t" style={{ borderColor: "var(--line)" }}>
      <div className="mx-auto flex max-w-[960px] flex-col items-start justify-between gap-3 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
        <p className="text-[12px]" style={{ color: "var(--muted)" }}>
          &copy; {new Date().getFullYear()} {SITE_NAME}. {t("footer.copyright")}
        </p>

        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          {footerLinks.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className="footer-link text-[12px]"
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

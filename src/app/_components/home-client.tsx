"use client";

import { useTranslation } from "@/hooks/use-translation";
import { type Locale } from "@/i18n/config";
import type { DailyIssue, SignalItem } from "@/interfaces/issue";
import { IssuePanel } from "./issue-panel";
import { SidebarPanel } from "./sidebar-panel";
import { SignalCard } from "./signal-card";
import Link from "next/link";
import type { CSSProperties } from "react";

interface HomeClientProps {
  locale: Locale;
  issue: DailyIssue;
  items: SignalItem[];
  topTags: [string, number][];
  activeCategories: string[];
  activeTag?: string;
  hasFilters: boolean;
}

export function HomeClient({
  locale,
  issue,
  items,
  activeCategories,
  activeTag,
  hasFilters,
}: HomeClientProps) {
  const { t } = useTranslation(locale);

  return (
    <main>
      <IssuePanel issue={issue} />

      <div
        className="mx-auto w-full max-w-[1088px] px-5 sm:px-6"
        style={{ paddingTop: "8px", paddingBottom: "64px" }}
      >
        {/* Clear filters bar */}
        {hasFilters && (
          <div
            className="flex items-center justify-between py-3"
            style={{ borderBottom: "0.8px solid var(--line)" }}
          >
            <span className="mono-label" style={{ fontSize: "10px" }}>
              FILTERING: {activeCategories.join(", ")} {activeTag ? `· ${activeTag}` : ""}
            </span>
            <Link
              href="/"
              className="font-mono-ui text-[11px] tracking-[1px] uppercase transition-colors hover-accent"
              style={{ color: "var(--muted)" }}
            >
              {t("home.clearFilters")} &times;
            </Link>
          </div>
        )}

        {/* Content grid */}
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Signals */}
          <section className="min-w-0">
            {items.length === 0 ? (
              <div className="py-16 text-center">
                <h2
                  className="editorial-title"
                  style={{ fontSize: "20px" }}
                >
                  {t("home.noMatchSignals")}
                </h2>
                <p
                  className="font-serif-cn mx-auto mt-2 max-w-sm"
                  style={{ fontSize: "14px", color: "var(--muted)" }}
                >
                  {t("home.noMatchDescription")}
                </p>
                <div className="mt-5 flex justify-center gap-2">
                  <Link href="/" className="btn-primary">{t("home.clearFiltersButton")}</Link>
                  <Link href="/search" className="btn-secondary">{t("home.goToSearch")}</Link>
                </div>
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={item.rank}
                  className="reveal-up"
                  style={{ "--delay": `${Math.min(index, 8) * 50}ms` } as CSSProperties}
                >
                  <SignalCard item={item} issueDate={issue.date} locale={locale} />
                </div>
              ))
            )}
          </section>

          {/* Sidebar */}
          <SidebarPanel issue={issue} />
        </div>
      </div>
    </main>
  );
}

import type { SourceConfig } from "../../src/types/schema";
import { sectionLabelToSlug } from "../../src/types/schema";
import type { AdapterResult, ItemDraft } from "../lib/draft";
import { fetchJson } from "../lib/http";
import { normalizeUrl, toIso, truncate } from "../lib/normalize";

/**
 * AI HOT 日报适配器——主内容源。
 * 接口为匿名只读，返回已整理好的日报（自带摘要与五大版块分类），零 AI 成本。
 */

const API_BASE = "https://aihot.virxact.com/api/v1";

interface RawItem {
  title?: string;
  summary?: string | null;
  source?: { name?: string } | null;
  links?: { aihot?: string; original?: string } | null;
  attribution?: { url?: string } | null;
}

interface RawSection {
  label?: string;
  items?: RawItem[];
}

interface RawReport {
  date?: string;
  generatedAt?: string;
  windowStart?: string;
  windowEnd?: string;
  lead?: string | null;
  links?: { aihot?: string };
  attribution?: { name?: string; url?: string };
  sections?: RawSection[];
}

interface RawResponse {
  report?: RawReport;
}

function isHttpUrl(value: string | undefined | null): value is string {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

export async function fetchAihot(source: SourceConfig, date: string): Promise<AdapterResult> {
  const primary = `${API_BASE}/dailies/${date}`;
  let raw: RawResponse;

  try {
    raw = await fetchJson<RawResponse>(primary);
  } catch {
    // 指定日期尚未生成时回退到最新一期
    raw = await fetchJson<RawResponse>(`${API_BASE}/dailies/latest`);
  }

  const report = raw.report;
  if (!report?.sections?.length) {
    return { items: [] };
  }

  const fallbackUrl = isHttpUrl(report.links?.aihot) ? report.links.aihot : source.url;
  const items: ItemDraft[] = [];

  for (const section of report.sections) {
    const label = (section.label ?? "").trim();
    const slug = sectionLabelToSlug(label);

    for (const item of section.items ?? []) {
      const title = (item.title ?? "").trim();
      if (!title) continue;

      const url = isHttpUrl(item.links?.original)
        ? item.links.original
        : isHttpUrl(item.links?.aihot)
          ? item.links.aihot
          : isHttpUrl(item.attribution?.url)
            ? item.attribution.url
            : fallbackUrl;

      if (!isHttpUrl(url)) continue;

      items.push({
        title,
        summary: truncate(item.summary ?? "", 160),
        url: normalizeUrl(url),
        sourceId: source.id,
        sourceName: (item.source?.name ?? source.name).trim() || source.name,
        section: slug,
        publishedAt: toIso(report.generatedAt),
      });
    }
  }

  const meta: AdapterResult["meta"] = {
    lead: report.lead ?? undefined,
    attribution: {
      name: report.attribution?.name ?? "AIHOT",
      url: isHttpUrl(report.attribution?.url) ? report.attribution.url : API_BASE,
    },
  };

  const start = toIso(report.windowStart);
  const end = toIso(report.windowEnd);
  if (start && end) {
    meta.window = { start, end };
  }

  return { items, meta };
}

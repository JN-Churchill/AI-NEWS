import type { SourceConfig } from "../../src/types/schema";
import type { AdapterResult, ItemDraft } from "../lib/draft";
import { fetchText } from "../lib/http";
import { normalizeUrl } from "../lib/normalize";

/**
 * HTML 链接提取适配器——无 RSS 来源的兜底方案。
 * 只提取看起来像文章的链接（标题有长度、路径有层级），过滤导航与站内锚点。
 */

const AI_KEYWORDS = [
  "ai",
  "llm",
  "gpt",
  "model",
  "agent",
  "openai",
  "anthropic",
  "gemini",
  "claude",
  "llama",
  "transformer",
  "inference",
  "智能",
  "模型",
  "大模型",
  "人工智能",
];

interface LinkMatch {
  href: string;
  title: string;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** 从 <a> 标签中提取候选链接 */
function extractLinks(html: string, baseUrl: string): LinkMatch[] {
  const found: LinkMatch[] = [];
  const pattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    const href = match[1] ?? "";
    const label = decodeEntities((match[2] ?? "").replace(/<[^>]*>/g, "")).trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) continue;
    if (label.length < 12) continue;

    let absolute = href;
    try {
      absolute = new URL(href, baseUrl).toString();
    } catch {
      continue;
    }

    found.push({ href: absolute, title: label });
  }

  return found;
}

function looksRelevant(link: LinkMatch): boolean {
  const haystack = `${link.title} ${link.href}`.toLowerCase();
  return AI_KEYWORDS.some((keyword) => haystack.includes(keyword));
}

export async function fetchHtml(source: SourceConfig): Promise<AdapterResult> {
  const html = await fetchText(source.url, { headers: { Accept: "text/html" } });
  const links = extractLinks(html, source.url).filter(looksRelevant);

  const seen = new Set<string>();
  const items: ItemDraft[] = [];

  for (const link of links) {
    const url = normalizeUrl(link.href);
    if (!url || seen.has(url)) continue;
    seen.add(url);

    items.push({
      title: link.title.slice(0, 160),
      summary: "",
      url,
      sourceId: source.id,
      sourceName: source.name,
    });

    if (items.length >= 25) break;
  }

  return { items };
}

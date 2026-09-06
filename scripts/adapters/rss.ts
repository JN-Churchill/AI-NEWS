import { XMLParser } from "fast-xml-parser";

import type { SourceConfig } from "../../src/types/schema";
import type { AdapterResult, ItemDraft } from "../lib/draft";
import { fetchText } from "../lib/http";
import { normalizeUrl, toIso, truncate } from "../lib/normalize";

/** RSS 2.0 / Atom 通用适配器 */

interface FeedNode {
  title?: unknown;
  link?: unknown;
  description?: unknown;
  summary?: unknown;
  content?: unknown;
  pubDate?: unknown;
  published?: unknown;
  updated?: unknown;
}

function text(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record["#text"] === "string") return record["#text"];
  }
  return "";
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function extractLink(node: FeedNode): string {
  const direct = text(node.link);
  if (direct) return direct;

  // Atom：<link href="..."/>
  const link = node.link as Record<string, unknown> | undefined;
  if (link && typeof link["@_href"] === "string") {
    return link["@_href"];
  }
  return "";
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export async function fetchFeed(source: SourceConfig): Promise<AdapterResult> {
  const feedUrl = source.feedUrl || source.url;
  const xml = await fetchText(feedUrl, { headers: { Accept: "application/rss+xml, application/xml" } });

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    trimValues: true,
  });
  const parsed = parser.parse(xml) as Record<string, any>;

  const rssItems = toArray<FeedNode>(parsed?.rss?.channel?.item);
  const atomItems = toArray<FeedNode>(parsed?.feed?.entry);
  const nodes = rssItems.length > 0 ? rssItems : atomItems;

  const items: ItemDraft[] = [];

  for (const node of nodes) {
    const title = stripHtml(text(node.title));
    const url = normalizeUrl(extractLink(node));
    if (!title || !url) continue;

    const rawSummary = text(node.description) || text(node.summary) || text(node.content);
    const published = toIso(text(node.pubDate) || text(node.published) || text(node.updated));

    items.push({
      title,
      summary: truncate(stripHtml(rawSummary), 160),
      url,
      sourceId: source.id,
      sourceName: source.name,
      publishedAt: published,
    });
  }

  return { items };
}

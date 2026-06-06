export type HtmlDiscoveryEntry = {
  title: string;
  url: string;
  summary: string;
  publishedAt: string;
};

const articleTypes = new Set(["article", "newsarticle", "blogposting", "techarticle", "report"]);

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&quot;/g, "\"")
    .replace(/&#34;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function textValue(value: unknown): string {
  if (!value) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }

  if (Array.isArray(value)) {
    return value.map(textValue).find(Boolean) ?? "";
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return textValue(record["@id"] ?? record.url ?? record.name);
  }

  return "";
}

function jsonLdNodes(value: unknown): Record<string, unknown>[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(jsonLdNodes);
  }

  if (typeof value !== "object") {
    return [];
  }

  const record = value as Record<string, unknown>;
  return [record, ...jsonLdNodes(record["@graph"])];
}

function typeValues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(typeValues);
  }

  return textValue(value)
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function typeMatches(value: unknown) {
  return typeValues(value).some((item) => articleTypes.has(item));
}

export function extractHtmlDiscoveryEntries(html: string): HtmlDiscoveryEntry[] {
  const scriptMatches = Array.from(
    html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  );
  const entries: HtmlDiscoveryEntry[] = [];

  for (const match of scriptMatches) {
    const rawJson = decodeHtmlEntities(match[1].trim());

    try {
      const parsed = JSON.parse(rawJson) as unknown;

      for (const node of jsonLdNodes(parsed)) {
        if (!typeMatches(node["@type"])) {
          continue;
        }

        const title = textValue(node.headline ?? node.name);
        const url = textValue(node.url ?? node.mainEntityOfPage ?? node["@id"]);

        if (!title || !url) {
          continue;
        }

        entries.push({
          title,
          url,
          summary: textValue(node.description ?? node.abstract),
          publishedAt: textValue(node.datePublished ?? node.dateModified ?? node.dateCreated),
        });
      }
    } catch {
      continue;
    }
  }

  return entries;
}

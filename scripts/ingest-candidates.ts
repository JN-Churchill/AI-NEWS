import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execFile } from "child_process";
import { promisify } from "util";
import { XMLParser } from "fast-xml-parser";
import {
  candidatePoolSchema,
  type CandidateItem,
  type CandidatePool,
  type CandidateSourceResult,
} from "../src/lib/candidate-schema";
import { sourceConfigListSchema, type SourceConfig } from "../src/lib/source-schema";

const sourcesPath = path.join(process.cwd(), "content", "sources.json");
const candidatesDirectory = path.join(process.cwd(), "content", "candidates");
const execFileAsync = promisify(execFile);

const args = process.argv.slice(2);

function getArg(name: string, fallback = "") {
  const index = args.indexOf(name);

  if (index >= 0) {
    return args[index + 1] ?? fallback;
  }

  const inline = args.find((arg) => arg.startsWith(`${name}=`));
  return inline ? inline.slice(name.length + 1) : fallback;
}

const date = getArg("--date", args.find((arg) => /^\d{4}-\d{2}-\d{2}$/.test(arg)) ?? new Date().toISOString().slice(0, 10));
const limitPerSource = Number(getArg("--limit", "8"));
const concurrency = Math.max(1, Math.min(8, Number(getArg("--concurrency", "4"))));
const retries = Math.max(0, Math.min(5, Number(getArg("--retries", "2"))));
const sourceFilter = getArg("--source");
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");

if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error(
    "Usage: npm run ingest -- --date YYYY-MM-DD [--limit 8] [--concurrency 4] [--retries 2] [--source source-id] [--dry-run] [--force]",
  );
  process.exit(1);
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
});

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function textValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map(textValue).find(Boolean) ?? "";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "object" && "#text" in value) {
    return textValue((value as Record<string, unknown>)["#text"]);
  }

  return "";
}

function cleanText(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trim()}...`;
}

function toAbsoluteUrl(value: string, baseUrl: string) {
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return "";
  }
}

function normalizeUrl(value: string) {
  try {
    const url = new URL(value);
    url.hash = "";
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref"].forEach((key) => {
      url.searchParams.delete(key);
    });
    return url.toString();
  } catch {
    return value;
  }
}

function parseDate(value: string, fallbackDate: string) {
  const parsed = value ? new Date(value) : null;

  if (parsed && !Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return new Date(`${fallbackDate}T09:00:00+08:00`).toISOString();
}

function inferTags(title: string, category: string) {
  const lower = title.toLowerCase();
  const tags = new Set<string>();

  const rules = [
    ["Agent", ["agent", "agents", "workflow", "tool use", "automation", "copilot"]],
    ["模型", ["model", "llm", "gpt", "claude", "gemini", "llama", "mistral", "deepseek", "qwen"]],
    ["多模态", ["multimodal", "vision", "audio", "video", "speech", "image"]],
    ["开源", ["open source", "github", "repo", "release", "local", "self-hosted"]],
    ["论文", ["paper", "arxiv", "benchmark", "eval", "research", "dataset"]],
    ["产品", ["launch", "product", "app", "api", "pricing", "preview", "beta"]],
    ["商业化", ["funding", "revenue", "enterprise", "startup", "acquisition", "customer"]],
    ["推理", ["inference", "serving", "latency", "gpu", "tpu", "quantization", "throughput"]],
    ["安全", ["safety", "security", "privacy", "alignment", "policy", "regulation"]],
  ] as const;

  rules.forEach(([tag, keywords]) => {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      tags.add(tag);
    }
  });

  if (tags.size === 0) {
    const fallback: Record<string, string> = {
      model: "模型",
      product: "产品",
      research: "论文",
      opensource: "开源",
      business: "商业",
      infra: "基础设施",
    };
    tags.add(fallback[category] ?? "AI");
  }

  return Array.from(tags).slice(0, 5);
}

function scoreCandidate(title: string, summary: string, source: SourceConfig, publishedAt: string) {
  const lower = `${title} ${summary}`.toLowerCase();
  const keywordWeights = [
    [8, ["openai", "anthropic", "google deepmind", "deepmind", "gemini", "gpt", "claude"]],
    [7, ["agent", "agents", "reasoning", "tool use", "computer use", "workflow"]],
    [6, ["benchmark", "eval", "sota", "state-of-the-art", "frontier", "multimodal"]],
    [5, ["api", "sdk", "release", "launch", "open source", "github", "pricing"]],
    [4, ["enterprise", "funding", "acquisition", "regulation", "safety", "privacy"]],
    [3, ["paper", "arxiv", "dataset", "inference", "gpu", "latency", "quantization"]],
  ] as const;
  const keywordScore = keywordWeights.reduce((score, [weight, keywords]) => {
    return score + (keywords.some((keyword) => lower.includes(keyword)) ? weight : 0);
  }, 0);
  const ageHours = Math.max(0, (Date.now() - new Date(publishedAt).getTime()) / 36e5);
  const freshness = Math.max(0, 10 - Math.min(10, Math.floor(ageHours / 12)));
  const typeBoost: Record<SourceConfig["type"], number> = {
    official: 11,
    paper: 9,
    community: 5,
    media: 3,
  };
  const categoryBoost: Record<string, number> = {
    model: 6,
    product: 4,
    research: 5,
    opensource: 4,
    infra: 4,
    business: 3,
  };
  const titleQuality = Math.min(6, Math.max(0, Math.floor(title.length / 22)));
  const placeholderPenalty = /页面抓取候选|等待人工复核/.test(summary) ? 8 : 0;

  return Math.min(
    100,
    Math.round(
      source.trustScore * 0.48 +
        typeBoost[source.type] +
        (categoryBoost[source.category] ?? 2) +
        keywordScore +
        freshness +
        titleQuality -
        placeholderPenalty,
    ),
  );
}

function candidateId(sourceId: string, url: string) {
  return `${sourceId}-${crypto.createHash("sha1").update(normalizeUrl(url)).digest("hex").slice(0, 12)}`;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchTextWithFetch(url: string) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(20000),
    headers: {
      "User-Agent": "AI-News-Index/0.2 (+https://example.com)",
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, */*",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

async function fetchTextWithPowerShell(url: string) {
  const escapedUrl = url.replace(/'/g, "''");
  const command = `$ProgressPreference='SilentlyContinue'; [Console]::OutputEncoding=[System.Text.Encoding]::UTF8; (Invoke-WebRequest -Uri '${escapedUrl}' -UseBasicParsing -TimeoutSec 30 -MaximumRedirection 5).Content`;
  const encodedCommand = Buffer.from(command, "utf16le").toString("base64");
  const { stdout } = await execFileAsync("powershell.exe", ["-NoProfile", "-EncodedCommand", encodedCommand], {
    maxBuffer: 1024 * 1024 * 8,
    encoding: "utf8",
  });

  return stdout;
}

async function fetchText(url: string) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fetchTextWithFetch(url);
    } catch (error) {
      lastError = error;

      if (attempt < retries) {
        await delay(500 * 2 ** attempt);
      }
    }
  }

  if (process.platform === "win32") {
    return fetchTextWithPowerShell(url);
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function rssLink(item: Record<string, unknown>, baseUrl: string) {
  const link = item.link;

  if (typeof link === "string") {
    return toAbsoluteUrl(link, baseUrl);
  }

  if (Array.isArray(link)) {
    const alternate =
      link.find((entry) => typeof entry === "object" && (entry as Record<string, unknown>)["@_rel"] === "alternate") ??
      link.find((entry) => typeof entry === "object" && (entry as Record<string, unknown>)["@_href"]);
    return alternate ? toAbsoluteUrl(String((alternate as Record<string, unknown>)["@_href"]), baseUrl) : "";
  }

  if (typeof link === "object" && link && "@_href" in link) {
    return toAbsoluteUrl(String((link as Record<string, unknown>)["@_href"]), baseUrl);
  }

  return "";
}

function parseFeed(xml: string, source: SourceConfig): CandidateItem[] {
  const parsed = parser.parse(xml) as Record<string, unknown>;
  const rssChannel = (parsed.rss as Record<string, unknown> | undefined)?.channel as Record<string, unknown> | undefined;
  const rssItems = asArray(rssChannel?.item as Record<string, unknown> | Record<string, unknown>[] | undefined);
  const atomFeed = parsed.feed as Record<string, unknown> | undefined;
  const atomItems = asArray(atomFeed?.entry as Record<string, unknown> | Record<string, unknown>[] | undefined);
  const rawItems = rssItems.length > 0 ? rssItems : atomItems;

  return rawItems
    .slice(0, limitPerSource * 3)
    .map((item) => {
      const title = cleanText(textValue(item.title));
      const url = normalizeUrl(rssLink(item, source.feedUrl || source.url));
      const summary = truncate(
        cleanText(
          textValue(item.description) ||
            textValue(item.summary) ||
            textValue(item.content) ||
            textValue(item["content:encoded"]),
        ),
        260,
      );
      const publishedAt = parseDate(
        textValue(item.pubDate) || textValue(item.published) || textValue(item.updated) || textValue(item.date),
        date,
      );

      return {
        id: candidateId(source.id, url || title),
        date,
        sourceId: source.id,
        sourceName: source.name,
        sourceType: source.type,
        category: source.category,
        title,
        url,
        summary,
        publishedAt,
        fetchedAt: new Date().toISOString(),
        score: scoreCandidate(title, summary, source, publishedAt),
        tags: inferTags(`${title} ${summary}`, source.category),
      };
    })
    .filter((item) => item.title && item.url);
}

function hrefFromAnchor(anchorAttributes: string) {
  const match = anchorAttributes.match(/\bhref\s*=\s*["']([^"']+)["']/i);
  return match?.[1]?.replace(/&amp;/g, "&") ?? "";
}

function parseHtmlLinks(html: string, source: SourceConfig): CandidateItem[] {
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
  const linkMatches = Array.from(body.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi));
  const seen = new Set<string>();
  const candidates: CandidateItem[] = [];
  const sourceHost = new URL(source.url).hostname.replace(/^www\./, "");

  for (const match of linkMatches) {
    const href = hrefFromAnchor(match[1]);
    const title = cleanText(match[2]);
    const url = normalizeUrl(toAbsoluteUrl(href, source.url));
    const normalizedTitle = title.toLowerCase();

    if (!url || !/^https?:\/\//i.test(url) || seen.has(url) || title.length < 10 || title.length > 180) {
      continue;
    }

    if (/^(skip to|sign in|log in|subscribe|careers|privacy|terms|contact|download press kit|try claude)/i.test(normalizedTitle)) {
      continue;
    }

    if (/\.(png|jpg|jpeg|gif|svg|webp|pdf|zip)$/i.test(new URL(url).pathname)) {
      continue;
    }

    const targetHost = new URL(url).hostname.replace(/^www\./, "");
    const sameHost = targetHost === sourceHost || targetHost.endsWith(`.${sourceHost}`);
    const looksRelevant = /(ai|agent|model|research|paper|blog|news|product|open|release|github|llm|api|gpt|claude|gemini)/i.test(
      `${title} ${url}`,
    );

    if (!sameHost && !looksRelevant) {
      continue;
    }

    seen.add(url);
    const publishedAt = new Date(`${date}T09:00:00+08:00`).toISOString();
    const summary = `${source.name} 页面抓取候选，等待人工复核摘要和来源细节。`;
    candidates.push({
      id: candidateId(source.id, url),
      date,
      sourceId: source.id,
      sourceName: source.name,
      sourceType: source.type,
      category: source.category,
      title,
      url,
      summary,
      publishedAt,
      fetchedAt: new Date().toISOString(),
      score: scoreCandidate(title, summary, source, publishedAt),
      tags: inferTags(title, source.category),
    });

    if (candidates.length >= limitPerSource) {
      break;
    }
  }

  if (candidates.length > 0) {
    return candidates;
  }

  const title = cleanText(textValue(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""));
  const url = normalizeUrl(source.url);
  const publishedAt = new Date(`${date}T09:00:00+08:00`).toISOString();
  const summary = `${source.name} 页面标题候选，等待人工复核摘要和来源细节。`;

  return title
    ? [
        {
          id: candidateId(source.id, url),
          date,
          sourceId: source.id,
          sourceName: source.name,
          sourceType: source.type,
          category: source.category,
          title,
          url,
          summary,
          publishedAt,
          fetchedAt: new Date().toISOString(),
          score: scoreCandidate(title, summary, source, publishedAt),
          tags: inferTags(title, source.category),
        },
      ]
    : [];
}

function shouldParseAsFeed(source: SourceConfig, body: string) {
  if (source.fetchMode === "feed" || source.parser === "rss" || source.parser === "atom") {
    return true;
  }

  return /^\s*</.test(body) && /<(rss|feed)\b/i.test(body.slice(0, 800));
}

async function ingestSource(source: SourceConfig) {
  if (source.fetchMode === "manual") {
    throw new Error("Manual source; no automatic collector configured");
  }

  if (source.requiresAuth && source.authEnv && !process.env[source.authEnv]) {
    throw new Error(`Missing ${source.authEnv}`);
  }

  if (source.fetchMode === "api") {
    throw new Error("API source adapter is not configured yet");
  }

  const targetUrl = source.feedUrl || source.url;
  const body = await fetchText(targetUrl);

  if (shouldParseAsFeed(source, body)) {
    return parseFeed(body, source).slice(0, limitPerSource);
  }

  return parseHtmlLinks(body, source).slice(0, limitPerSource);
}

async function mapWithConcurrency<T, R>(items: T[], workerCount: number, handler: (item: T) => Promise<R>) {
  const results: R[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const currentIndex = index;
      index += 1;
      results[currentIndex] = await handler(items[currentIndex]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(workerCount, items.length) }, worker));
  return results;
}

async function main() {
  const allSources = sourceConfigListSchema.parse(JSON.parse(fs.readFileSync(sourcesPath, "utf8")));
  const sources = allSources.filter((source) => (sourceFilter ? source.id === sourceFilter : source.enabled));

  if (sources.length === 0) {
    console.error(sourceFilter ? `No source found for ${sourceFilter}.` : "No enabled sources found.");
    process.exit(1);
  }

  const collected: CandidateItem[] = [];
  const sourceResults: CandidateSourceResult[] = await mapWithConcurrency(sources, concurrency, async (source) => {
    const fetchedAt = new Date().toISOString();

    if (!source.enabled && !sourceFilter) {
      return {
        sourceId: source.id,
        sourceName: source.name,
        status: "skipped",
        itemCount: 0,
        message: "Source disabled",
        fetchedAt,
      };
    }

    try {
      const items = await ingestSource(source);
      collected.push(...items);
      console.log(`OK ${source.id} ${items.length} candidates`);
      return {
        sourceId: source.id,
        sourceName: source.name,
        status: "ok",
        itemCount: items.length,
        fetchedAt,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const status = source.fetchMode === "manual" || source.fetchMode === "api" || message.startsWith("Missing ") ? "skipped" : "failed";
      console.error(`${status.toUpperCase()} ${source.id}: ${message}`);
      return {
        sourceId: source.id,
        sourceName: source.name,
        status,
        itemCount: 0,
        message,
        fetchedAt,
      };
    }
  });

  const byUrl = new Map<string, CandidateItem>();

  for (const item of collected) {
    const key = normalizeUrl(item.url);
    const existing = byUrl.get(key);

    if (!existing || item.score > existing.score) {
      byUrl.set(key, item);
    }
  }

  const items = Array.from(byUrl.values()).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  const pool: CandidatePool = candidatePoolSchema.parse({
    date,
    generatedAt: new Date().toISOString(),
    sourceCount: sources.length,
    itemCount: items.length,
    sourceResults,
    items,
  });

  const outputPath = path.join(candidatesDirectory, `${date}.json`);

  if (dryRun) {
    console.log(JSON.stringify(pool, null, 2));
    return;
  }

  if (fs.existsSync(outputPath) && !force) {
    console.error(`${path.relative(process.cwd(), outputPath)} already exists. Use --force to overwrite.`);
    process.exit(1);
  }

  fs.mkdirSync(candidatesDirectory, { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(pool, null, 2)}\n`, "utf8");
  console.log(`Created ${path.relative(process.cwd(), outputPath)} with ${pool.itemCount} candidates`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

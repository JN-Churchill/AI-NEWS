import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execFile } from "child_process";
import http from "http";
import https from "https";
import { promisify } from "util";
import { XMLParser } from "fast-xml-parser";
import { candidatePoolSchema, type CandidateItem, type CandidatePool } from "../src/lib/candidate-schema";
import { sourceConfigListSchema, type SourceConfig } from "../src/lib/source-schema";

const sourcesPath = path.join(process.cwd(), "content", "sources.json");
const candidatesDirectory = path.join(process.cwd(), "content", "candidates");

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
const sourceFilter = getArg("--source");
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");

if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error("Usage: npm run ingest -- --date YYYY-MM-DD [--limit 8] [--source source-id] [--dry-run] [--force]");
  process.exit(1);
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
});
const execFileAsync = promisify(execFile);

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
    url.searchParams.delete("utm_source");
    url.searchParams.delete("utm_medium");
    url.searchParams.delete("utm_campaign");
    url.searchParams.delete("utm_term");
    url.searchParams.delete("utm_content");
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
    ["Agent", ["agent", "agents", "workflow", "tool use", "automation"]],
    ["模型", ["model", "llm", "gpt", "claude", "gemini", "llama", "mistral"]],
    ["多模态", ["multimodal", "vision", "audio", "video", "speech"]],
    ["开源", ["open source", "github", "repo", "release"]],
    ["论文", ["paper", "arxiv", "benchmark", "eval", "research"]],
    ["产品", ["launch", "product", "app", "api", "pricing"]],
    ["商业化", ["funding", "revenue", "enterprise", "startup", "acquisition"]],
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

  return Array.from(tags).slice(0, 4);
}

function scoreCandidate(title: string, source: SourceConfig, publishedAt: string) {
  const lower = title.toLowerCase();
  const keywordBoosts = [
    "agent",
    "model",
    "openai",
    "anthropic",
    "google",
    "benchmark",
    "release",
    "api",
    "open source",
    "multimodal",
    "reasoning",
    "llm",
  ];
  const keywordScore = keywordBoosts.filter((keyword) => lower.includes(keyword)).length * 3;
  const ageHours = Math.max(0, (Date.now() - new Date(publishedAt).getTime()) / 36e5);
  const freshness = Math.max(0, 12 - Math.min(12, Math.floor(ageHours / 12)));
  const typeBoost: Record<SourceConfig["type"], number> = {
    official: 10,
    paper: 8,
    community: 4,
    media: 2,
  };

  return Math.min(100, Math.round(source.trustScore * 0.55 + typeBoost[source.type] + keywordScore + freshness));
}

function candidateId(sourceId: string, url: string) {
  return `${sourceId}-${crypto.createHash("sha1").update(normalizeUrl(url)).digest("hex").slice(0, 12)}`;
}

async function fetchTextWithNode(url: string, redirects = 0): Promise<string> {
  if (redirects > 5) {
    throw new Error("Too many redirects");
  }

  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === "http:" ? http : https;
    const request = client.get(
      {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        family: 4,
        timeout: 20000,
        headers: {
          "User-Agent": "AI-News-Index/0.1 (+https://example.com)",
          Accept: "application/rss+xml, application/atom+xml, text/html, */*",
        },
      },
      (response) => {
        const status = response.statusCode ?? 0;
        const location = response.headers.location;

        if (status >= 300 && status < 400 && location) {
          response.resume();
          fetchTextWithNode(new URL(location, url).toString(), redirects + 1).then(resolve).catch(reject);
          return;
        }

        if (status < 200 || status >= 300) {
          response.resume();
          reject(new Error(`HTTP ${status}`));
          return;
        }

        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      },
    );

    request.on("timeout", () => {
      request.destroy(new Error("Request timeout"));
    });
    request.on("error", reject);
  });
}

async function fetchTextWithPowerShell(url: string) {
  const escapedUrl = url.replace(/'/g, "''");
  const command = `$ProgressPreference='SilentlyContinue'; [Console]::OutputEncoding=[System.Text.Encoding]::UTF8; (Invoke-WebRequest -Uri '${escapedUrl}' -UseBasicParsing -TimeoutSec 30).Content`;
  const encodedCommand = Buffer.from(command, "utf16le").toString("base64");
  const { stdout } = await execFileAsync(
    "powershell.exe",
    [
      "-NoProfile",
      "-EncodedCommand",
      encodedCommand,
    ],
    {
      maxBuffer: 1024 * 1024 * 8,
      encoding: "utf8",
    },
  );

  return stdout;
}

async function fetchText(url: string) {
  try {
    return await fetchTextWithNode(url);
  } catch (error) {
    if (process.platform !== "win32") {
      throw error;
    }

    return fetchTextWithPowerShell(url);
  }
}

function rssLink(item: Record<string, unknown>, baseUrl: string) {
  const link = item.link;

  if (typeof link === "string") {
    return toAbsoluteUrl(link, baseUrl);
  }

  if (Array.isArray(link)) {
    const alternate = link.find((entry) => typeof entry === "object" && (entry as Record<string, unknown>)["@_href"]);
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

  return rawItems.slice(0, limitPerSource * 2).map((item) => {
    const title = cleanText(textValue(item.title));
    const url = normalizeUrl(rssLink(item, source.feedUrl || source.url));
    const summary = truncate(
      cleanText(
        textValue(item.description) ||
          textValue(item.summary) ||
          textValue(item.content) ||
          textValue(item["content:encoded"]),
      ),
      220,
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
      score: scoreCandidate(title, source, publishedAt),
      tags: inferTags(title, source.category),
    };
  }).filter((item) => item.title && item.url);
}

function parseHtmlLinks(html: string, source: SourceConfig): CandidateItem[] {
  const linkMatches = Array.from(html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi));
  const seen = new Set<string>();
  const candidates: CandidateItem[] = [];

  for (const match of linkMatches) {
    const href = match[1];
    const title = cleanText(match[2]);
    const url = normalizeUrl(toAbsoluteUrl(href, source.url));

    if (!url || seen.has(url) || title.length < 10 || title.length > 160) {
      continue;
    }

    if (/\.(png|jpg|jpeg|gif|svg|webp|pdf)$/i.test(url)) {
      continue;
    }

    const sameHost = new URL(url).hostname.replace(/^www\./, "") === new URL(source.url).hostname.replace(/^www\./, "");
    const looksRelevant = /(ai|agent|model|research|paper|blog|news|product|open|release|github|llm|api)/i.test(`${title} ${url}`);

    if (!sameHost && !looksRelevant) {
      continue;
    }

    seen.add(url);
    const publishedAt = new Date(`${date}T09:00:00+08:00`).toISOString();
    candidates.push({
      id: candidateId(source.id, url),
      date,
      sourceId: source.id,
      sourceName: source.name,
      sourceType: source.type,
      category: source.category,
      title,
      url,
      summary: `${source.name} 页面抓取候选，等待人工复核摘要和来源细节。`,
      publishedAt,
      fetchedAt: new Date().toISOString(),
      score: scoreCandidate(title, source, publishedAt),
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
          summary: `${source.name} 页面标题候选，等待人工复核摘要和来源细节。`,
          publishedAt,
          fetchedAt: new Date().toISOString(),
          score: scoreCandidate(title, source, publishedAt),
          tags: inferTags(title, source.category),
        },
      ]
    : [];
}

async function ingestSource(source: SourceConfig) {
  const targetUrl = source.feedUrl || source.url;
  const body = await fetchText(targetUrl);

  if (source.feedUrl || /^\s*</.test(body) && /<(rss|feed)\b/i.test(body.slice(0, 500))) {
    return parseFeed(body, source).slice(0, limitPerSource);
  }

  return parseHtmlLinks(body, source).slice(0, limitPerSource);
}

async function main() {
  const sources = sourceConfigListSchema
    .parse(JSON.parse(fs.readFileSync(sourcesPath, "utf8")))
    .filter((source) => source.enabled)
    .filter((source) => !sourceFilter || source.id === sourceFilter);

  if (sources.length === 0) {
    console.error(sourceFilter ? `No enabled source found for ${sourceFilter}.` : "No enabled sources found.");
    process.exit(1);
  }

  const collected: CandidateItem[] = [];

  for (const source of sources) {
    try {
      const items = await ingestSource(source);
      collected.push(...items);
      console.log(`OK ${source.id} ${items.length} candidates`);
    } catch (error) {
      console.error(`FAILED ${source.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

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

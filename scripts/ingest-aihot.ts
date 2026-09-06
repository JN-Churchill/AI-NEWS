/**
 * ingest-aihot.ts — 拉取 AI HOT 日报并写入 content/aihot/YYYY-MM-DD.json。
 *
 * 用法:
 *   npm run ingest:aihot                          # 取最新日报（北京时间的"今天"）
 *   npm run ingest:aihot -- --date 2026-09-05     # 取指定日期
 *   npm run ingest:aihot -- --dry-run             # 只打印不写盘
 *   npm run ingest:aihot -- --force               # 覆盖已存在的同日文件
 *
 * 数据源（匿名只读）:
 *   /api/v1/dailies/latest | /api/v1/dailies/{date} | /api/v1/dailies?limit=7
 *   /api/v1/items?mode=selected&window=7d&limit=100   # 仅用于补充每条时间
 */

import fs from "fs";
import path from "path";

import {
  aihotDailySchema,
  rawAihotDailyListSchema,
  rawAihotItemsResponseSchema,
  rawAihotReportSchema,
  type AihotItem,
} from "../src/lib/aihot-schema";

const API_BASE = "https://aihot.virxact.com/api/v1";
const USER_AGENT = "ai-signal-index-ingest/1.0 (+https://aihot.virxact.com/terms)";
const FETCH_TIMEOUT_MS = 20_000;
const MAX_RETRIES = 2;

function getArg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) {
    return undefined;
  }
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) {
    return undefined;
  }
  return value;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url: string): Promise<{ status: number; json: unknown }> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      // 404 不重试：调用方需要用它做分支（latest 不存在时回退列表）
      if (response.status === 404) {
        return { status: 404, json: null };
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return { status: response.status, json: await response.json() };
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES) {
        await sleep(500 * 2 ** attempt);
      }
    }
  }

  throw lastError;
}

async function resolveDaily(dateArg: string | undefined) {
  if (dateArg) {
    const { status, json } = await fetchJson(`${API_BASE}/dailies/${dateArg}`);
    if (status === 404 || !json) {
      console.error(`[ingest-aihot] AI HOT 日报 ${dateArg} 不存在（接口返回 404）。`);
      process.exit(1);
    }
    return json;
  }

  const latest = await fetchJson(`${API_BASE}/dailies/latest`);

  if (latest.status !== 404 && latest.json) {
    return latest.json;
  }

  // 回退：查询最近 7 期索引，取其中最近一期
  console.warn("[ingest-aihot] 当日日报尚未生成，回退到最近一期。");
  const list = await fetchJson(`${API_BASE}/dailies?limit=7`);

  if (list.status === 404 || !list.json) {
    console.error("[ingest-aihot] 日报索引接口不可用，无法回退。");
    process.exit(1);
  }

  const parsedList = rawAihotDailyListSchema.safeParse(list.json);
  if (!parsedList.success) {
    console.error(`[ingest-aihot] 日报索引响应无法解析：${parsedList.error.message}`);
    process.exit(1);
  }

  const [mostRecent] = parsedList.data.items;
  if (!mostRecent) {
    console.error("[ingest-aihot] 日报索引为空，AI HOT 侧暂无可取的日报。");
    process.exit(1);
  }

  console.warn(`[ingest-aihot] 最近一期为 ${mostRecent.date}。`);
  const fallback = await fetchJson(`${API_BASE}/dailies/${mostRecent.date}`);

  if (fallback.status === 404 || !fallback.json) {
    console.error(`[ingest-aihot] 回退日报 ${mostRecent.date} 拉取失败。`);
    process.exit(1);
  }

  return fallback.json;
}

/** 从 links.aihot（https://aihot.virxact.com/items/<id>）提取条目 publicId */
function extractPublicId(aihotUrl: string | undefined): string | null {
  if (!aihotUrl) {
    return null;
  }
  try {
    const { pathname } = new URL(aihotUrl);
    const match = pathname.match(/^\/items\/([^/]+)$/);
    return match ? (match[1] ?? null) : null;
  } catch {
    return null;
  }
}

function isHttpUrl(value: string | undefined): value is string {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

/** 统一归一化为带时区的 ISO（zod datetime({offset:true}) 才能通过） */
function normalizeIso(value: string | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

interface TimeEntry {
  publishedAt?: string;
  discoveredAt?: string;
}

/** 一次性拉取最近 7 天精选池，建 publicId → 时间 的索引；失败降级为空 Map（不阻断） */
async function buildTimeIndex(): Promise<Map<string, TimeEntry>> {
  const index = new Map<string, TimeEntry>();

  try {
    const { json } = await fetchJson(`${API_BASE}/items?mode=selected&window=7d&limit=100`);
    const parsed = rawAihotItemsResponseSchema.parse(json);

    for (const entry of parsed.items ?? []) {
      const key = entry.id ?? extractPublicId(entry.links?.aihot);
      if (!key) {
        continue;
      }
      index.set(key, {
        publishedAt: normalizeIso(entry.publishedAt),
        discoveredAt: normalizeIso(entry.discoveredAt),
      });
    }

    console.log(`[ingest-aihot] 时间索引就绪：${index.size} 条（近 7 天精选池）。`);
  } catch (error) {
    console.warn(
      `[ingest-aihot] 时间富化接口不可用（${error instanceof Error ? error.message : String(error)}），所有条目将标记为无精确时间。`,
    );
  }

  return index;
}

function truncate(text: string, max: number): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length <= max ? normalized : `${normalized.slice(0, max - 1)}…`;
}

function enrichItem(
  raw: {
    title?: string;
    summary?: string | null;
    source?: { name?: string } | null;
    links?: { aihot?: string; original?: string } | null;
    attribution?: { url?: string } | null;
  },
  sectionLabel: string,
  dailyUrl: string,
  timeIndex: Map<string, TimeEntry>,
): AihotItem {
  const title = raw.title?.trim();
  if (!title) {
    throw new Error(`版块「${sectionLabel}」存在无标题条目，中止写入。`);
  }

  const publicId = extractPublicId(raw.links?.aihot);
  const hit = publicId ? timeIndex.get(publicId) : undefined;

  let publishedAt: string | undefined;
  let isDiscoveryTime = false;
  let matchSource: AihotItem["matchSource"] = "none";

  if (hit?.publishedAt) {
    publishedAt = hit.publishedAt;
    matchSource = "publishedAt";
  } else if (hit?.discoveredAt) {
    publishedAt = hit.discoveredAt;
    isDiscoveryTime = true;
    matchSource = "discoveredAt";
  }

  const aihotUrl = isHttpUrl(raw.links?.aihot)
    ? raw.links.aihot
    : isHttpUrl(raw.attribution?.url)
      ? raw.attribution.url
      : dailyUrl;

  return {
    title,
    summary: truncate(raw.summary ?? "", 80),
    sourceName: raw.source?.name?.trim() ?? "",
    aihotUrl,
    originalUrl: isHttpUrl(raw.links?.original) ? raw.links.original : undefined,
    section: sectionLabel,
    publishedAt,
    isDiscoveryTime,
    matchSource,
  };
}

async function main() {
  const dateArg = getArg("date");
  const force = hasFlag("force");
  const dryRun = hasFlag("dry-run");

  if (dateArg && !/^\d{4}-\d{2}-\d{2}$/.test(dateArg)) {
    console.error("[ingest-aihot] --date 需要 YYYY-MM-DD 格式。");
    process.exit(1);
  }

  console.log(`[ingest-aihot] 拉取 AI HOT 日报（目标：${dateArg ?? "latest"}）…`);
  const rawJson = await resolveDaily(dateArg);
  const raw = rawAihotReportSchema.parse(rawJson);
  const report = raw.report;

  const timeIndex = await buildTimeIndex();

  const sections = report.sections.map((section) => ({
    label: section.label,
    items: section.items.map((item) => enrichItem(item, section.label, report.links?.aihot ?? "", timeIndex)),
  }));

  const allItems = sections.flatMap((section) => section.items);

  const daily = aihotDailySchema.parse({
    schemaVersion: 1,
    date: report.date,
    generatedAt: normalizeIso(report.generatedAt),
    windowStart: normalizeIso(report.windowStart),
    windowEnd: normalizeIso(report.windowEnd),
    sourceUrl: report.links?.aihot ?? report.attribution?.url ?? "",
    attribution: {
      name: report.attribution?.name ?? "AIHOT",
      url: report.attribution?.url ?? report.links?.aihot ?? API_BASE,
    },
    lead: report.lead ?? null,
    itemCount: allItems.length,
    matchedCount: allItems.filter((item) => item.matchSource !== "none").length,
    discoveryCount: allItems.filter((item) => item.isDiscoveryTime).length,
    ingestAt: new Date().toISOString(),
    sections,
  });

  if (dryRun) {
    console.log(JSON.stringify(daily, null, 2));
    console.log(`[ingest-aihot] dry-run：共 ${daily.itemCount} 条（匹配 ${daily.matchedCount}，收录时间 ${daily.discoveryCount}）。未写盘。`);
    return;
  }

  const outDir = path.join(process.cwd(), "content", "aihot");
  const outPath = path.join(outDir, `${daily.date}.json`);

  if (fs.existsSync(outPath) && !force) {
    console.error(`[ingest-aihot] ${daily.date} 已存在（${outPath}）。如需覆盖请加 --force。`);
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(daily, null, 2)}\n`);

  console.log(
    `[ingest-aihot] 已写入 ${outPath}：共 ${daily.itemCount} 条（精确时间 ${daily.matchedCount - daily.discoveryCount}，收录时间 ${daily.discoveryCount}，未匹配 ${daily.itemCount - daily.matchedCount}）。`,
  );
}

main().catch((error) => {
  console.error(`[ingest-aihot] 执行失败：${error instanceof Error ? error.stack ?? error.message : String(error)}`);
  process.exit(1);
});

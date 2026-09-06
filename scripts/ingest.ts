import fs from "node:fs";
import path from "node:path";

import {
  candidateSchema,
  sourceConfigSchema,
  type SourceConfig,
  type UnifiedItem,
} from "../src/types/schema";
import { fetchAihot } from "./adapters/aihot";
import { fetchFeed } from "./adapters/rss";
import { fetchHtml } from "./adapters/html";
import type { AdapterResult, ItemDraft } from "./lib/draft";
import { clusterDrafts } from "./lib/dedupe";
import { fetchJson } from "./lib/http";
import { makeId, normalizeUrl } from "./lib/normalize";
import { buildWhyItMatters, extractTopics, resolveSection } from "./lib/classify";
import { computeHeat } from "./lib/score";

/**
 * 统一采集入口：并发调度所有启用来源 → 归一化 → 跨源去重聚类 → 打分归类 → 写入候选池。
 *
 * 用法：
 *   npm run ingest                        # 采集今天（北京时间）
 *   npm run ingest -- --date 2026-09-06   # 采集指定日期
 *   npm run ingest -- --source aihot      # 只采集指定来源
 */

const CONCURRENCY = 4;
const SOURCES_PATH = path.join(process.cwd(), "content", "sources.json");
const CANDIDATES_DIR = path.join(process.cwd(), "content", "candidates");

function getArg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  return !value || value.startsWith("--") ? undefined : value;
}

/** 北京时间今天 */
function bjtToday(): string {
  return new Date(Date.now() + 8 * 3_600_000).toISOString().slice(0, 10);
}

function loadSources(filterId?: string): SourceConfig[] {
  const raw = JSON.parse(fs.readFileSync(SOURCES_PATH, "utf8")) as unknown;
  const parsed = sourceConfigSchema.array().parse(raw);
  return parsed.filter((source) => source.enabled && (!filterId || source.id === filterId));
}

async function runAdapter(
  source: SourceConfig,
  date: string,
): Promise<{ sourceId: string; result?: AdapterResult; error?: string }> {
  try {
    if (source.strategy === "aihot") {
      return { sourceId: source.id, result: await fetchAihot(source, date) };
    }
    if (source.strategy === "feed") {
      return { sourceId: source.id, result: await fetchFeed(source) };
    }
    if (source.strategy === "html") {
      return { sourceId: source.id, result: await fetchHtml(source) };
    }
    return { sourceId: source.id, error: `来源策略 ${source.strategy} 未启用自动采集` };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[ingest] 来源 ${source.id} 采集失败：${message}`);
    return { sourceId: source.id, error: message };
  }
}

/** 简易并发池，单源失败不阻断全局 */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index]!);
    }
  });

  await Promise.all(runners);
  return results;
}

function toUnifiedItem(
  cluster: ReturnType<typeof clusterDrafts>[number],
  sources: Map<string, SourceConfig>,
  referenceTime: number,
): UnifiedItem | null {
  const draft = cluster.primary;
  const source = sources.get(draft.sourceId);
  if (!source) return null;

  const url = normalizeUrl(draft.url);
  if (!url) return null;

  const section = resolveSection(draft, source);
  const topics = extractTopics(`${draft.title} ${draft.summary}`);
  const { metrics, heatScore } = computeHeat({
    draft,
    source,
    crossSourceCount: cluster.crossSourceCount,
    section,
    referenceTime,
  });

  return {
    id: makeId(draft.sourceId, url),
    title: draft.title,
    summary: draft.summary || `来自 ${source.name} 的今日 AI 动态，点击查看完整内容。`,
    whyItMatters: buildWhyItMatters({ section, topics, sourceName: source.name, heatScore }),
    url,
    sourceId: source.id,
    sourceName: source.name,
    section,
    topics,
    publishedAt: draft.publishedAt,
    heatScore,
    metrics,
    crossSourceCount: cluster.crossSourceCount,
    duplicateUrls: cluster.duplicates.map((item) => normalizeUrl(item.url)).filter(Boolean),
  };
}

export async function runIngest(options: { date?: string; onlySource?: string } = {}) {
  const date = options.date ?? bjtToday();
  const onlySource = options.onlySource;
  const sources = loadSources(onlySource);

  console.log(`[ingest] 目标日期 ${date}，启用来源 ${sources.length} 个。`);

  const outcomes = await mapWithConcurrency(sources, CONCURRENCY, (source) =>
    runAdapter(source, date),
  );

  const drafts: ItemDraft[] = [];
  const fetchErrors: { sourceId: string; message: string }[] = [];

  for (const outcome of outcomes) {
    if (outcome.error) {
      fetchErrors.push({ sourceId: outcome.sourceId, message: outcome.error });
      continue;
    }
    for (const item of outcome.result?.items ?? []) {
      drafts.push(item);
    }
  }

  console.log(`[ingest] 原始条目 ${drafts.length} 条，开始跨源去重聚类…`);
  const clusters = clusterDrafts(drafts);

  const sourceMap = new Map(sources.map((source) => [source.id, source]));
  const referenceTime = Date.now();

  const items = clusters
    .map((cluster) => toUnifiedItem(cluster, sourceMap, referenceTime))
    .filter((item): item is UnifiedItem => item !== null)
    .sort((a, b) => b.heatScore - a.heatScore);

  const pool = candidateSchema.parse({
    date,
    generatedAt: new Date().toISOString(),
    items,
    fetchErrors,
  });

  fs.mkdirSync(CANDIDATES_DIR, { recursive: true });
  const outPath = path.join(CANDIDATES_DIR, `${date}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(pool, null, 2)}\n`);

  const crossSource = items.filter((item) => item.crossSourceCount > 1).length;
  console.log(
    `[ingest] 已写入 ${outPath}：去重后 ${items.length} 条（跨源热点 ${crossSource} 条，来源失败 ${fetchErrors.length} 个）。`,
  );
}

// 仅在 CLI 直接运行时执行；被 pipeline / instrumentation 导入时只暴露函数
const isDirectRun = (process.argv[1] ?? "").replace(/\\/g, "/").endsWith("/ingest.ts");
if (isDirectRun) {
  runIngest().catch((error) => {
    console.error("[ingest] 执行失败：", error);
    process.exit(1);
  });
}

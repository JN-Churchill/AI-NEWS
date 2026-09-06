import fs from "node:fs";
import path from "node:path";

import {
  candidateSchema,
  dailyIssueSchema,
  SECTION_DEFS,
  type DailyIssue,
  type UnifiedItem,
} from "../src/types/schema";

/**
 * 候选池 → 正式日报。
 *
 * 用法：
 *   npm run issue:build                            # 构建今天
 *   npm run issue:build -- --date 2026-09-06       # 构建指定日期
 *   npm run issue:build -- --min-heat 40 --per-section 4
 */

const MIN_HEAT = 35;
// 每版块条数：与前端三列网格对齐，取 6 正好两行排满，不留空缺
const PER_SECTION = 6;

const CANDIDATES_DIR = path.join(process.cwd(), "content", "candidates");
const ISSUES_DIR = path.join(process.cwd(), "content", "issues");

function getArg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  return !value || value.startsWith("--") ? undefined : value;
}

function bjtToday(): string {
  return new Date(Date.now() + 8 * 3_600_000).toISOString().slice(0, 10);
}

function bjtWindow(date: string): { start: string; end: string } {
  const startMs = new Date(`${date}T00:00:00+08:00`).getTime();
  return {
    start: new Date(startMs).toISOString(),
    end: new Date(startMs + 86_400_000).toISOString(),
  };
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function buildLead(candidateCount: number, sections: { label: string; count: number }[]): string {
  const active = sections.filter((section) => section.count > 0).map((section) => section.label.replace(/\/.+$/, ""));
  const total = sections.reduce((sum, section) => sum + section.count, 0);
  const coverage = active.slice(0, 3).join("、") || "多个方向";
  return `本期从 ${candidateCount} 条候选信号中筛出 ${total} 条，覆盖 ${coverage} 等方向，帮你五分钟掌握今日 AI 关键变化。`;
}

export function runBuildIssue(options: { date?: string; minHeat?: number; perSection?: number } = {}) {
  const date = options.date ?? bjtToday();
  const minHeat = options.minHeat ?? MIN_HEAT;
  const perSection = options.perSection ?? PER_SECTION;

  const candidatePath = path.join(CANDIDATES_DIR, `${date}.json`);
  if (!fs.existsSync(candidatePath)) {
    throw new Error(`候选池不存在：${candidatePath}，请先运行采集`);
  }

  const pool = candidateSchema.parse(JSON.parse(fs.readFileSync(candidatePath, "utf8")));
  const qualified = pool.items.filter((item) => item.heatScore >= minHeat);

  // 每版块取热度最高的若干条，保证版块均衡不偏食
  const sections = SECTION_DEFS.map((definition) => {
    const items = qualified
      .filter((item) => item.section === definition.slug)
      .sort((a, b) => b.heatScore - a.heatScore)
      .slice(0, perSection);
    return { slug: definition.slug, label: definition.label, items };
  }).filter((section) => section.items.length > 0);

  const allItems: UnifiedItem[] = sections.flatMap((section) => section.items);

  const sourceCounts = new Map<string, number>();
  for (const item of allItems) {
    sourceCounts.set(item.sourceName, (sourceCounts.get(item.sourceName) ?? 0) + 1);
  }

  const issue: DailyIssue = dailyIssueSchema.parse({
    schemaVersion: 1,
    date,
    issueNo: date.replace(/-/g, "."),
    status: "published",
    generatedAt: new Date().toISOString(),
    window: bjtWindow(date),
    lead: buildLead(pool.items.length, sections.map(({ label, items }) => ({ label, count: items.length }))),
    candidateCount: pool.items.length,
    sections,
    stats: {
      total: allItems.length,
      avgHeat: average(allItems.map((item) => item.heatScore)),
      maxHeat: allItems.length > 0 ? Math.max(...allItems.map((item) => item.heatScore)) : 0,
      sourceCount: sourceCounts.size,
      crossSourceCount: allItems.filter((item) => item.crossSourceCount > 1).length,
      bySection: sections.map((section) => ({
        slug: section.slug,
        label: section.label,
        count: section.items.length,
        avgHeat: average(section.items.map((item) => item.heatScore)),
      })),
      topSources: [...sourceCounts.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    },
    attribution: { name: "AI 日报 · 自动聚合", url: "https://aihot.virxact.com/" },
    fetchErrors: pool.fetchErrors,
  });

  fs.mkdirSync(ISSUES_DIR, { recursive: true });
  const outPath = path.join(ISSUES_DIR, `${date}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(issue, null, 2)}\n`);

  console.log(
    `[issue] 已生成 ${outPath}：${issue.stats.total} 条（候选 ${issue.candidateCount}），平均热度 ${issue.stats.avgHeat}，来源 ${issue.stats.sourceCount} 个。`,
  );
}

// 仅在 CLI 直接运行时执行
const isDirectRun = (process.argv[1] ?? "").replace(/\\/g, "/").endsWith("/build-issue.ts");
if (isDirectRun) {
  try {
    runBuildIssue();
  } catch (error) {
    console.error("[issue] 执行失败：", error);
    process.exit(1);
  }
}

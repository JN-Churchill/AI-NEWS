import fs from "node:fs";
import path from "node:path";

import { dailyIssueSchema, searchIndexSchema, type DailyIssue, type SearchIndex } from "@/types/schema";

/**
 * 内容读取层——构建期从 content/ 目录读取 JSON（Git as Database）。
 * 静态导出模式下这些函数只在构建时执行，无运行时开销。
 */

const CONTENT_DIR = path.join(process.cwd(), "content");
const ISSUES_DIR = path.join(CONTENT_DIR, "issues");
const INDEX_PATH = path.join(CONTENT_DIR, "index", "search-index.json");

function readJsonFile<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch (error) {
    console.error(`[content] 读取失败 ${filePath}：`, error);
    return null;
  }
}

/** 所有日报日期，最新在前 */
export function listIssueDates(): string[] {
  if (!fs.existsSync(ISSUES_DIR)) return [];
  return fs
    .readdirSync(ISSUES_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(/\.json$/, ""))
    .sort((a, b) => (a < b ? 1 : -1));
}

export function getIssue(date: string): DailyIssue | null {
  const raw = readJsonFile<unknown>(path.join(ISSUES_DIR, `${date}.json`));
  if (!raw) return null;

  const parsed = dailyIssueSchema.safeParse(raw);
  if (!parsed.success) {
    console.error(`[content] 日报 ${date} 校验失败：`, parsed.error.message);
    return null;
  }
  return parsed.data;
}

export function getLatestIssue(): DailyIssue | null {
  const [latest] = listIssueDates();
  return latest ? getIssue(latest) : null;
}

export function getAllIssues(): DailyIssue[] {
  return listIssueDates()
    .map((date) => getIssue(date))
    .filter((issue): issue is DailyIssue => issue !== null);
}

/** 上一期 / 下一期，用于日报详情页翻页 */
export function getNeighbourIssues(date: string): { prev: DailyIssue | null; next: DailyIssue | null } {
  const dates = listIssueDates();
  const index = dates.indexOf(date);
  if (index === -1) return { prev: null, next: null };

  const nextDate = dates[index - 1];
  const prevDate = dates[index + 1];
  return {
    prev: prevDate ? getIssue(prevDate) : null,
    next: nextDate ? getIssue(nextDate) : null,
  };
}

export function getSearchIndex(): SearchIndex {
  const raw = readJsonFile<unknown>(INDEX_PATH);
  if (!raw) {
    return { generatedAt: new Date().toISOString(), total: 0, dates: [], entries: [] };
  }
  const parsed = searchIndexSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("[content] 搜索索引校验失败：", parsed.error.message);
    return { generatedAt: new Date().toISOString(), total: 0, dates: [], entries: [] };
  }
  return parsed.data;
}

/** 按月份分组，用于归档页时间线 */
export function groupIssuesByMonth(issues: DailyIssue[]): { month: string; items: DailyIssue[] }[] {
  const groups = new Map<string, DailyIssue[]>();

  for (const issue of issues) {
    const month = issue.date.slice(0, 7);
    const bucket = groups.get(month);
    if (bucket) {
      bucket.push(issue);
    } else {
      groups.set(month, [issue]);
    }
  }

  return [...groups.entries()]
    .map(([month, items]) => ({ month, items }))
    .sort((a, b) => (a.month < b.month ? 1 : -1));
}

export function formatDateCn(date: string): string {
  const [year, month, day] = date.split("-");
  return `${year} 年 ${Number(month)} 月 ${Number(day)} 日`;
}

export function weekdayCn(date: string): string {
  const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  return weekdays[new Date(`${date}T00:00:00+08:00`).getDay()] ?? "";
}

import fs from "fs";
import path from "path";
import type { DailyIssue, SignalItem } from "@/interfaces/issue";
import { categoryNames } from "@/lib/categories";
import { dailyIssueSchema } from "@/lib/issue-schema";

const issuesDirectory = path.join(process.cwd(), "content", "issues");
let issueDatesCache: string[] | null = null;
const issueCache = new Map<string, DailyIssue>();

export function getIssueDates() {
  if (issueDatesCache) {
    return issueDatesCache;
  }

  if (!fs.existsSync(issuesDirectory)) {
    return [];
  }

  issueDatesCache = fs
    .readdirSync(issuesDirectory)
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => fileName.replace(/\.json$/, ""))
    .sort()
    .reverse();

  return issueDatesCache;
}

export function getIssueByDate(date: string): DailyIssue | null {
  const cached = issueCache.get(date);

  if (cached) {
    return cached;
  }

  const fullPath = path.join(issuesDirectory, `${date}.json`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const issue = dailyIssueSchema.parse(JSON.parse(fs.readFileSync(fullPath, "utf8")));
  const sortedIssue = {
    ...issue,
    items: [...issue.items].sort((a, b) => a.rank - b.rank),
  };
  issueCache.set(date, sortedIssue);
  return sortedIssue;
}

export function getAllIssues() {
  return getIssueDates()
    .map((date) => getIssueByDate(date))
    .filter((issue): issue is DailyIssue => issue !== null);
}

export function getLatestIssue() {
  return getAllIssues()[0] ?? null;
}

function normalizeCategories(category?: string | string[]) {
  const values = Array.isArray(category) ? category : (category ?? "").split(",");
  return values.map((item) => item.trim()).filter((item) => item && item !== "all");
}

export function getFilteredItems(issue: DailyIssue, category?: string | string[], tag?: string) {
  const categories = normalizeCategories(category);
  const activeTag = tag?.trim().toLowerCase();

  if (categories.length === 0 && !activeTag) {
    return issue.items;
  }

  return issue.items.filter((item) => {
    const categoryMatched = categories.length === 0 || categories.includes(item.category);
    const tagMatched = !activeTag || item.tags.some((itemTag) => itemTag.toLowerCase() === activeTag);
    return categoryMatched && tagMatched;
  });
}

export function getCategoryName(category: string) {
  return categoryNames[category] ?? category;
}

export function getTopTags(items: SignalItem[]) {
  const counts = new Map<string, number>();

  items.forEach((item) => {
    item.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
}

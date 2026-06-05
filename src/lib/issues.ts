import fs from "fs";
import path from "path";
import type { DailyIssue, SignalItem } from "@/interfaces/issue";
import { categoryNames } from "@/lib/categories";
import { dailyIssueSchema } from "@/lib/issue-schema";

const issuesDirectory = path.join(process.cwd(), "content", "issues");

export function getIssueDates() {
  if (!fs.existsSync(issuesDirectory)) {
    return [];
  }

  return fs
    .readdirSync(issuesDirectory)
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => fileName.replace(/\.json$/, ""))
    .sort()
    .reverse();
}

export function getIssueByDate(date: string): DailyIssue | null {
  const fullPath = path.join(issuesDirectory, `${date}.json`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const issue = dailyIssueSchema.parse(JSON.parse(fs.readFileSync(fullPath, "utf8")));
  return {
    ...issue,
    items: [...issue.items].sort((a, b) => a.rank - b.rank),
  };
}

export function getAllIssues() {
  return getIssueDates()
    .map((date) => getIssueByDate(date))
    .filter((issue): issue is DailyIssue => issue !== null);
}

export function getLatestIssue() {
  return getAllIssues()[0] ?? null;
}

export function getFilteredItems(issue: DailyIssue, category?: string) {
  if (!category || category === "all") {
    return issue.items;
  }

  return issue.items.filter((item) => item.category === category);
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

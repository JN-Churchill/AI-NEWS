import type { DailyIssue } from "@/interfaces/issue";
import { getAllIssues } from "@/lib/issues";
import { getEnabledSources } from "@/lib/sources";

const defaultMaxPublicIssueAgeDays = 3;

function getMaxPublicIssueAgeDays() {
  const rawValue = process.env.PUBLIC_ISSUE_MAX_AGE_DAYS;
  const value = rawValue ? Number(rawValue) : defaultMaxPublicIssueAgeDays;

  if (!Number.isFinite(value) || value < 1) {
    return defaultMaxPublicIssueAgeDays;
  }

  return Math.floor(value);
}

function getIssueAgeDays(issue: DailyIssue | null, now: Date) {
  if (!issue) {
    return null;
  }

  const issueDate = new Date(`${issue.date}T00:00:00+08:00`);
  const ageMs = now.getTime() - issueDate.getTime();

  return Math.max(0, Math.floor(ageMs / 86_400_000));
}

export function getSiteHealth(now = new Date()) {
  const issues = getAllIssues();
  const latestIssue = issues[0] ?? null;
  const sources = getEnabledSources();
  const maxPublicIssueAgeDays = getMaxPublicIssueAgeDays();
  const contentAgeDays = getIssueAgeDays(latestIssue, now);
  const contentFresh = contentAgeDays !== null && contentAgeDays <= maxPublicIssueAgeDays;
  const warnings: string[] = [];

  if (latestIssue === null) {
    warnings.push("No published issue is available.");
  } else if (!contentFresh) {
    warnings.push(`Latest issue is ${contentAgeDays} days old.`);
  }

  if (sources.length === 0) {
    warnings.push("No enabled sources are configured.");
  }

  const ok = latestIssue !== null && sources.length > 0 && contentFresh;

  return {
    ok,
    generatedAt: now.toISOString(),
    publicIssueCount: issues.length,
    latestIssueDate: latestIssue?.date ?? null,
    latestIssueStatus: latestIssue?.status ?? null,
    enabledSourceCount: sources.length,
    contentFresh,
    contentAgeDays,
    maxPublicIssueAgeDays,
    warnings,
  };
}

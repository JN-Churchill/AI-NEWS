import type { DailyIssue } from "../src/lib/issue-schema";

const internalWordingPattern = /发布前|等待人工|待人工|页面抓取候选|待补充|草稿|复核后发布|placeholder|todo/i;

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function getTextFields(issue: DailyIssue) {
  return [
    ["title", issue.title],
    ["summary", issue.summary],
    ...issue.items.flatMap((item, index) => [
      [`items.${index + 1}.title`, item.title],
      [`items.${index + 1}.summary`, item.summary],
      [`items.${index + 1}.whyItMatters`, item.whyItMatters],
      [`items.${index + 1}.source`, item.source],
      [`items.${index + 1}.tags`, item.tags.join(" ")],
    ]),
  ] as const;
}

export function getPublicIssueQualityErrors(issue: DailyIssue) {
  const errors: string[] = [];
  const ranks = issue.items.map((item) => item.rank);
  const expectedRanks = issue.items.map((_, index) => index + 1);
  const categoryCounts = new Map<string, number>();

  issue.items.forEach((item) => {
    categoryCounts.set(item.category, (categoryCounts.get(item.category) ?? 0) + 1);
  });

  if (new Set(ranks).size !== ranks.length) {
    errors.push("items ranks must be unique.");
  }

  if (ranks.some((rank, index) => rank !== expectedRanks[index])) {
    errors.push(`items ranks must be sequential: ${expectedRanks.join(", ")}.`);
  }

  if (issue.candidateCount < issue.selectedCount) {
    errors.push("candidateCount must be greater than or equal to selectedCount.");
  }

  issue.categories.forEach((category) => {
    const actualCount = categoryCounts.get(category.slug) ?? 0;

    if (category.count !== actualCount) {
      errors.push(`categories.${category.slug}.count must be ${actualCount}.`);
    }
  });

  issue.items.forEach((item) => {
    if (!isHttpUrl(item.sourceUrl)) {
      errors.push(`items.${item.rank}.sourceUrl must be a valid http(s) URL.`);
    }
  });

  getTextFields(issue).forEach(([field, value]) => {
    if (internalWordingPattern.test(value)) {
      errors.push(`${field} contains internal draft/review wording.`);
    }
  });

  return errors;
}

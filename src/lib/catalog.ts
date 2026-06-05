import type { SignalItem } from "@/interfaces/issue";
import { getAllIssues } from "@/lib/issues";

export type SignalEntry = SignalItem & {
  issueDate: string;
  issueNo: string;
};

export function getAllSignalEntries(): SignalEntry[] {
  return getAllIssues().flatMap((issue) =>
    issue.items.map((item) => ({
      ...item,
      issueDate: issue.date,
      issueNo: issue.issueNo,
    })),
  );
}

export function getAllTopicSlugs() {
  return Array.from(new Set(getAllSignalEntries().map((item) => item.category))).sort();
}

export function getTopicEntries(slug: string) {
  return getAllSignalEntries().filter((item) => item.category === slug);
}

export function searchSignalEntries(query: string) {
  const keyword = query.trim().toLowerCase();

  if (!keyword) {
    return [];
  }

  return getAllSignalEntries().filter((item) => {
    const haystack = [
      item.title,
      item.summary,
      item.whyItMatters,
      item.source,
      item.category,
      ...item.tags,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(keyword);
  });
}

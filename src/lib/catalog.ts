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

function normalizeTokens(query: string) {
  return Array.from(
    new Set(
      query
        .trim()
        .toLowerCase()
        .split(/[\s,，、/|]+/)
        .map((token) => token.trim())
        .filter(Boolean),
    ),
  );
}

function scoreEntry(item: SignalEntry, tokens: string[]) {
  const title = item.title.toLowerCase();
  const summary = item.summary.toLowerCase();
  const whyItMatters = item.whyItMatters.toLowerCase();
  const source = item.source.toLowerCase();
  const category = item.category.toLowerCase();
  const tags = item.tags.map((tag) => tag.toLowerCase());
  const haystack = [title, summary, whyItMatters, source, category, ...tags].join(" ");

  if (!tokens.every((token) => haystack.includes(token))) {
    return 0;
  }

  return tokens.reduce((score, token) => {
    if (title.includes(token)) {
      score += 8;
    }

    if (tags.some((tag) => tag.includes(token))) {
      score += 6;
    }

    if (source.includes(token) || category.includes(token)) {
      score += 4;
    }

    if (summary.includes(token) || whyItMatters.includes(token)) {
      score += 2;
    }

    return score;
  }, 0);
}

export function searchSignalEntries(query: string) {
  const tokens = normalizeTokens(query);

  if (tokens.length === 0) {
    return [];
  }

  return getAllSignalEntries()
    .map((item) => ({
      item,
      score: scoreEntry(item, tokens),
    }))
    .filter((result) => result.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.item.publishedAt).getTime() - new Date(a.item.publishedAt).getTime() ||
        a.item.rank - b.item.rank,
    )
    .map((result) => result.item);
}

import type { CandidateItem } from "@/lib/candidate-schema";

const placeholderSummaryPattern = /页面抓取候选|页面标题候选|等待人工复核|^\s*comments\s*$/i;

export function hasUsableCandidateSummary(summary: string) {
  const normalized = summary.trim();

  return normalized.length >= 30 && !placeholderSummaryPattern.test(normalized);
}

export function getCandidateSummaryPenalty(summary: string) {
  const normalized = summary.trim();

  if (!normalized) {
    return 20;
  }

  if (placeholderSummaryPattern.test(normalized)) {
    return 18;
  }

  if (normalized.length < 30) {
    return 10;
  }

  return 0;
}

export function getCandidateEditorialScore(candidate: Pick<CandidateItem, "score" | "summary">) {
  return Math.max(0, Math.round(candidate.score - getCandidateSummaryPenalty(candidate.summary)));
}

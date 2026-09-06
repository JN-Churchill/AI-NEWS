import { createHash } from "node:crypto";

const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "ref",
  "spm",
  "from",
  "share_token",
];

/** URL 规范化：统一协议、去 hash、去跟踪参数、去尾斜杠 */
export function normalizeUrl(raw: string): string {
  const value = (raw ?? "").trim();
  if (!value) return "";
  try {
    const url = new URL(value);
    url.protocol = "https:";
    url.hash = "";
    for (const param of TRACKING_PARAMS) {
      url.searchParams.delete(param);
    }
    const path = url.pathname.replace(/\/+$/, "");
    return `${url.origin}${path}${url.search}`;
  } catch {
    return value;
  }
}

/** 稳定条目 ID：来源 + 规范化 URL */
export function makeId(sourceId: string, url: string): string {
  return createHash("sha1").update(`${sourceId}:${normalizeUrl(url)}`).digest("hex").slice(0, 12);
}

/** 标题分词：去标点、小写、保留中英文与数字 */
export function tokenize(text: string): string[] {
  return (text ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

/** 标题 Jaccard 相似度，用于跨源同事件判定 */
export function similarity(a: string, b: string): number {
  const left = new Set(tokenize(a));
  const right = new Set(tokenize(b));
  if (left.size === 0 || right.size === 0) return 0;

  let intersection = 0;
  for (const token of left) {
    if (right.has(token)) intersection += 1;
  }
  return intersection / (left.size + right.size - intersection);
}

/** 文本截断，优先在句末收尾 */
export function truncate(text: string, limit: number): string {
  const value = (text ?? "").replace(/\s+/g, " ").trim();
  if (value.length <= limit) return value;

  const head = value.slice(0, limit);
  for (let i = head.length - 1; i > limit * 0.5; i -= 1) {
    if ("。！？；…".includes(head[i - 1] ?? "")) return head.slice(0, i);
  }
  return `${head.slice(0, limit - 1)}…`;
}

/** 补齐为带时区偏移的 ISO 字符串（schema 要求 offset） */
export function toIso(value: string | number | Date | undefined | null): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

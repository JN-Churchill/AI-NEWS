import type { ItemDraft } from "./draft";
import { normalizeUrl, similarity } from "./normalize";

const SIMILARITY_THRESHOLD = 0.82;

export interface DraftCluster {
  primary: ItemDraft;
  duplicates: ItemDraft[];
  /** 独立来源报道数（1 = 独家），直接喂给热度分的跨源加成 */
  crossSourceCount: number;
}

/**
 * 跨源去重与聚类：
 * 1. 先按规范化 URL 精确合并
 * 2. 再按标题 Jaccard 相似度合并（阈值 0.82）
 * 3. 保留信息量最大的一条作为主条目（有摘要 > 有发布时间 > 标题更长）
 */
export function clusterDrafts(drafts: ItemDraft[]): DraftCluster[] {
  const byUrl = new Map<string, ItemDraft[]>();

  for (const draft of drafts) {
    const key = normalizeUrl(draft.url);
    if (!key) continue;
    const bucket = byUrl.get(key);
    if (bucket) {
      bucket.push(draft);
    } else {
      byUrl.set(key, [draft]);
    }
  }

  const representatives = [...byUrl.values()].map((bucket) => pickPrimary(bucket));

  const clusters: DraftCluster[] = [];
  const used = new Set<ItemDraft>();

  for (const candidate of representatives) {
    if (used.has(candidate)) continue;

    const group: ItemDraft[] = [candidate];
    used.add(candidate);

    for (const other of representatives) {
      if (used.has(other)) continue;
      if (similarity(candidate.title, other.title) >= SIMILARITY_THRESHOLD) {
        group.push(other);
        used.add(other);
      }
    }

    const primary = pickPrimary(group);
    const duplicates = group.filter((item) => item !== primary);
    const sourceIds = new Set(group.map((item) => item.sourceId));

    clusters.push({
      primary,
      duplicates,
      crossSourceCount: Math.max(1, sourceIds.size),
    });
  }

  return clusters;
}

function pickPrimary(bucket: ItemDraft[]): ItemDraft {
  return [...bucket].sort((a, b) => scoreCompleteness(b) - scoreCompleteness(a))[0] ?? bucket[0]!;
}

function scoreCompleteness(draft: ItemDraft): number {
  let score = 0;
  if (draft.summary && draft.summary.length > 30) score += 4;
  if (draft.publishedAt) score += 2;
  if (draft.section) score += 2;
  score += Math.min(draft.title.length, 120) / 120;
  return score;
}

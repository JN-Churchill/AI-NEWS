import type { HeatMetrics, SectionSlug, SourceConfig } from "../../src/types/schema";
import type { ItemDraft } from "./draft";

/**
 * 热度指数评分引擎——纯规则、零成本、可解释。
 *
 * 六维加权（合计封顶 100）：
 *   实用性 30 + 新颖度 20 + 影响力 20 + 可信度 15 + 受众广度 10 + 时效 5
 *   另有跨源加成 0-10（同一事件被多个独立来源报道）
 *
 * 之所以不接 LLM：规则透明可公示（/about 页面），且不产生任何 API 成本。
 */

const LAUNCH_WORDS = [
  "发布", "推出", "上线", "开源", "开放", "宣布", "引入", "支持",
  "launch", "release", "introduc", "announc", "unveil", "open-source", "now available", "general availability",
];

const IMPACT_WORDS = [
  "融资", "收购", "并购", "上市", "监管", "禁令", "诉讼", "裁员", "合作", "战略",
  "funding", "raise", "series", "acqui", "merger", "ipo", "regulation", "ban", "lawsuit", "partnership",
];

const RESEARCH_WORDS = [
  "论文", "研究", "基准", "评测", "实验", "方法", "数据集",
  "paper", "arxiv", "benchmark", "eval", "dataset", "study", "research",
];

const AUDIENCE_BY_TYPE: Record<SourceConfig["type"], number> = {
  official: 10,
  media: 8,
  community: 6,
  paper: 5,
};

function matches(text: string, words: string[]): number {
  const haystack = text.toLowerCase();
  return words.filter((word) => haystack.includes(word)).length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export interface HeatInput {
  draft: ItemDraft;
  source: SourceConfig;
  crossSourceCount: number;
  section: SectionSlug;
  referenceTime: number;
}

/** 时效性：24 小时内满分，3 天内递减，更早给基础分 */
function freshnessScore(publishedAt: string | undefined, referenceTime: number): number {
  if (!publishedAt) return 3;
  const published = new Date(publishedAt).getTime();
  if (Number.isNaN(published)) return 3;

  const hours = (referenceTime - published) / 3_600_000;
  if (hours <= 24) return 5;
  if (hours <= 72) return 3;
  if (hours <= 168) return 2;
  return 1;
}

export function computeHeat(input: HeatInput): { metrics: HeatMetrics; heatScore: number } {
  const { draft, source, crossSourceCount, section, referenceTime } = input;
  const text = `${draft.title} ${draft.summary}`;

  const launchHits = matches(text, LAUNCH_WORDS);
  const impactHits = matches(text, IMPACT_WORDS);
  const researchHits = matches(text, RESEARCH_WORDS);

  // 实用性：有摘要、有明确动作、实操向内容更高
  let utility = 12;
  if (draft.summary.length > 40) utility += 6;
  if (launchHits > 0) utility += 6;
  if (section === "insights") utility += 4;
  if (researchHits > 0) utility += 3;

  // 新颖度：首次发布/开源类信号最强
  let novelty = 6;
  novelty += Math.min(launchHits, 2) * 5;
  if (section === "models" || section === "products") novelty += 4;

  // 影响力：资本与监管动作影响面最大
  let impact = 6;
  impact += Math.min(impactHits, 3) * 4;
  if (source.type === "official") impact += 2;

  // 可信度：直接由来源权威度映射
  const credibility = (source.trustScore / 100) * 15;

  const audience = AUDIENCE_BY_TYPE[source.type];

  const freshness = freshnessScore(draft.publishedAt, referenceTime);

  // 跨源加成：每多一个独立来源 +5，封顶 10
  const crossSource = Math.min(10, Math.max(0, crossSourceCount - 1) * 5);

  const metrics: HeatMetrics = {
    utility: clamp(Math.round(utility), 0, 30),
    novelty: clamp(Math.round(novelty), 0, 20),
    impact: clamp(Math.round(impact), 0, 20),
    credibility: clamp(Math.round(credibility * 10) / 10, 0, 15),
    audience,
    freshness,
    crossSource,
  };

  const raw =
    metrics.utility +
    metrics.novelty +
    metrics.impact +
    metrics.credibility +
    metrics.audience +
    metrics.freshness +
    metrics.crossSource;

  return { metrics, heatScore: clamp(Math.round(raw * 10) / 10, 0, 100) };
}

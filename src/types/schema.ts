import { z } from "zod";

/**
 * 统一数据契约——采集、打分、渲染、索引、订阅全链路的唯一真相来源。
 *
 * 设计要点：
 * 1. 单一流水线：AI HOT API 与 RSS/HTML 来源都归一化为 UnifiedItem，
 *    彻底消除旧项目"自建线有分无版块、AI HOT 线有版块无分"的双轨割裂。
 * 2. 可解释评分：六维热度指标公开可查，支撑 /about 页面公示算法。
 * 3. 零成本默认：摘要走 PassthroughSummarizer，LLM 为可选插件。
 */

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const isoDateTime = z.string().datetime({ offset: true });

/* ---------------- 版块：五大分类，与 AI HOT 日报 API 的 section.label 对齐 ---------------- */

export const SECTION_DEFS = [
  { slug: "models", label: "模型发布/更新", short: "模型", icon: "cpu" },
  { slug: "products", label: "产品发布/更新", short: "产品", icon: "rocket" },
  { slug: "industry", label: "行业动态", short: "行业", icon: "trend" },
  { slug: "papers", label: "论文研究", short: "论文", icon: "doc" },
  { slug: "insights", label: "技巧与观点", short: "观点", icon: "bulb" },
] as const;

export const sectionSlugSchema = z.enum(["models", "products", "industry", "papers", "insights"]);
export type SectionSlug = z.infer<typeof sectionSlugSchema>;

/** AI HOT 返回的中文 label → 站内 slug；未命中时回退 insights */
export const SECTION_LABEL_TO_SLUG: Record<string, SectionSlug> = {
  "模型发布/更新": "models",
  "产品发布/更新": "products",
  行业动态: "industry",
  论文研究: "papers",
  "技巧与观点": "insights",
};

export function sectionLabelToSlug(label: string): SectionSlug {
  return SECTION_LABEL_TO_SLUG[label.trim()] ?? "insights";
}

export function sectionMeta(slug: SectionSlug) {
  return SECTION_DEFS.find((item) => item.slug === slug) ?? SECTION_DEFS[4];
}

/* ---------------- 主题标签：可跨版块的横向维度 ---------------- */

export const TOPIC_DEFS = [
  { slug: "funding", name: "融资" },
  { slug: "opensource", name: "开源" },
  { slug: "benchmark", name: "评测" },
  { slug: "agent", name: "Agent" },
  { slug: "multimodal", name: "多模态" },
  { slug: "infra", name: "基础设施" },
  { slug: "safety", name: "安全对齐" },
  { slug: "robotics", name: "具身智能" },
] as const;

export type TopicSlug = (typeof TOPIC_DEFS)[number]["slug"];

/* ---------------- 热度指数：六维 + 跨源加成，合计封顶 100 ---------------- */

export const HEAT_DIMENSIONS = [
  { key: "utility", name: "实用性", max: 30, desc: "对读者工作与决策的直接帮助程度" },
  { key: "novelty", name: "新颖度", max: 20, desc: "信息是否首次出现、是否带来增量认知" },
  { key: "impact", name: "影响力", max: 20, desc: "对行业格局或技术路线的潜在影响范围" },
  { key: "credibility", name: "可信度", max: 15, desc: "来源权威度与信息可验证性" },
  { key: "audience", name: "受众广度", max: 10, desc: "覆盖人群规模与话题普及程度" },
  { key: "freshness", name: "时效", max: 5, desc: "相对日报时间窗的新鲜程度" },
  { key: "crossSource", name: "跨源加成", max: 10, desc: "同一事件被多个独立来源报道的共现加成" },
] as const;

export const heatMetricsSchema = z.object({
  utility: z.number().min(0).max(30),
  novelty: z.number().min(0).max(20),
  impact: z.number().min(0).max(20),
  credibility: z.number().min(0).max(15),
  audience: z.number().min(0).max(10),
  freshness: z.number().min(0).max(5),
  crossSource: z.number().min(0).max(10),
});

export type HeatMetrics = z.infer<typeof heatMetricsSchema>;

/* ---------------- 统一条目：所有适配器的共同输出 ---------------- */

export const unifiedItemSchema = z.object({
  /** 稳定 ID：来源 ID + 规范化 URL 的哈希 */
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string(),
  /** "为什么重要"——规则化生成，零 LLM 成本 */
  whyItMatters: z.string(),
  url: z.string().url(),
  sourceId: z.string(),
  sourceName: z.string(),
  section: sectionSlugSchema,
  topics: z.array(z.string()),
  publishedAt: isoDateTime.optional(),
  heatScore: z.number().min(0).max(100),
  metrics: heatMetricsSchema,
  /** 该事件被多少独立来源报道（1 = 独家） */
  crossSourceCount: z.number().int().min(1),
  /** 被合并的重复条目链接，保留审计线索 */
  duplicateUrls: z.array(z.string()).default([]),
});

export type UnifiedItem = z.infer<typeof unifiedItemSchema>;

/* ---------------- 每日日报：网站、RSS、索引的唯一数据源 ---------------- */

export const issueSectionSchema = z.object({
  slug: sectionSlugSchema,
  label: z.string().min(1),
  items: z.array(unifiedItemSchema),
});

export const dailyIssueSchema = z.object({
  schemaVersion: z.literal(1),
  date: isoDate,
  issueNo: z.string(),
  status: z.enum(["draft", "published"]),
  generatedAt: isoDateTime,
  window: z.object({ start: isoDateTime, end: isoDateTime }),
  lead: z.string(),
  candidateCount: z.number().int().min(0),
  sections: z.array(issueSectionSchema),
  stats: z.object({
    total: z.number().int().min(0),
    avgHeat: z.number().min(0).max(100),
    maxHeat: z.number().min(0).max(100),
    sourceCount: z.number().int().min(0),
    crossSourceCount: z.number().int().min(0),
    bySection: z.array(
      z.object({
        slug: sectionSlugSchema,
        label: z.string(),
        count: z.number().int().min(0),
        avgHeat: z.number().min(0).max(100),
      }),
    ),
    topSources: z.array(z.object({ name: z.string(), count: z.number().int() })),
  }),
  attribution: z.object({ name: z.string(), url: z.string() }),
  /** 单源失败不阻断全局，记录降级原因 */
  fetchErrors: z.array(z.object({ sourceId: z.string(), message: z.string() })).default([]),
});

export type DailyIssue = z.infer<typeof dailyIssueSchema>;
export type IssueSection = z.infer<typeof issueSectionSchema>;

/* ---------------- 来源配置 ---------------- */

export const sourceStrategySchema = z.enum(["aihot", "feed", "html", "api", "manual"]);
export const sourceCategorySchema = z.enum(["model", "research", "opensource", "product", "business", "infra"]);

export const sourceConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: sourceCategorySchema,
  type: z.enum(["official", "paper", "community", "media"]),
  url: z.string().url(),
  feedUrl: z.string().default(""),
  /** 取代旧项目的 fetchMode + parser 双字段，避免两者不一致 */
  strategy: sourceStrategySchema,
  /** 该来源天然倾向的版块，用于无版块来源的兜底归类 */
  defaultSection: sectionSlugSchema,
  topics: z.array(z.string()).default([]),
  trustScore: z.number().min(0).max(100),
  enabled: z.boolean(),
  notes: z.string().default(""),
});

export type SourceConfig = z.infer<typeof sourceConfigSchema>;

/* ---------------- 候选池：抓取原始产物，可回溯审计 ---------------- */

export const candidateSchema = z.object({
  date: isoDate,
  generatedAt: isoDateTime,
  items: z.array(unifiedItemSchema),
  fetchErrors: z.array(z.object({ sourceId: z.string(), message: z.string() })).default([]),
});

export type CandidatePool = z.infer<typeof candidateSchema>;

/* ---------------- 搜索索引：构建期生成，客户端过滤 ---------------- */

export const searchEntrySchema = z.object({
  id: z.string(),
  date: isoDate,
  title: z.string(),
  summary: z.string(),
  url: z.string(),
  sourceName: z.string(),
  section: sectionSlugSchema,
  topics: z.array(z.string()),
  heatScore: z.number(),
});

export const searchIndexSchema = z.object({
  generatedAt: isoDateTime,
  total: z.number().int(),
  dates: z.array(isoDate),
  entries: z.array(searchEntrySchema),
});

export type SearchIndex = z.infer<typeof searchIndexSchema>;
export type SearchEntry = z.infer<typeof searchEntrySchema>;

/* ---------------- 可插拔摘要器：默认直通，零成本 ---------------- */

export interface SummarizerInput {
  title: string;
  summary: string;
  url: string;
}

export interface Summarizer {
  readonly name: string;
  summarize(input: SummarizerInput): Promise<string>;
}

/** 默认实现：直接采用来源自带摘要，不产生任何 API 成本 */
export const passthroughSummarizer: Summarizer = {
  name: "passthrough",
  async summarize(input) {
    return input.summary;
  },
};

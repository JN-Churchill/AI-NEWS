import type { SectionSlug, SourceConfig } from "../../src/types/schema";
import { TOPIC_DEFS } from "../../src/types/schema";
import type { ItemDraft } from "./draft";

/** 版块归类：优先用来源自带版块（AI HOT），否则按关键词与来源属性推断 */

const SECTION_RULES: { section: SectionSlug; words: string[] }[] = [
  {
    section: "papers",
    words: ["论文", "研究", "基准", "评测", "数据集", "arxiv", "paper", "benchmark", "dataset", "eval", "study"],
  },
  {
    section: "models",
    words: ["模型", "大模型", "开源模型", "权重", "推理", "微调", "model", "llm", "gpt", "claude", "gemini", "llama", "weights", "inference", "fine-tun"],
  },
  {
    section: "products",
    words: ["产品", "应用", "上线", "功能", "版本", "发布", "app", "product", "feature", "release", "launch", "update", "tool"],
  },
  {
    section: "industry",
    words: ["融资", "收购", "估值", "监管", "政策", "市场", "营收", "合作", "funding", "acqui", "valuation", "regulation", "market", "revenue", "partnership"],
  },
  {
    section: "insights",
    words: ["技巧", "观点", "教程", "实践", "经验", "指南", "如何", "tip", "guide", "tutorial", "opinion", "how to", "best practice"],
  },
];

export function resolveSection(draft: ItemDraft, source: SourceConfig): SectionSlug {
  if (draft.section) return draft.section;

  const text = `${draft.title} ${draft.summary}`.toLowerCase();
  let best: { section: SectionSlug; hits: number } = { section: source.defaultSection, hits: 0 };

  for (const rule of SECTION_RULES) {
    const hits = rule.words.filter((word) => text.includes(word)).length;
    if (hits > best.hits) {
      best = { section: rule.section, hits };
    }
  }

  return best.section;
}

/** 主题打标：可跨版块的横向维度 */
export function extractTopics(text: string): string[] {
  const haystack = text.toLowerCase();
  const topics: string[] = [];

  const rules: { slug: string; words: string[] }[] = [
    { slug: "funding", words: ["融资", "估值", "轮", "funding", "raise", "series", "valuation", "投资"] },
    { slug: "opensource", words: ["开源", "开放权重", "open source", "open-source", "apache", "mit license", "github"] },
    { slug: "benchmark", words: ["基准", "评测", "榜单", "benchmark", "eval", "score", "sota", "排行榜"] },
    { slug: "agent", words: ["agent", "智能体", "智能代理", "autonomous", "tool use", "mcp"] },
    { slug: "multimodal", words: ["多模态", "视频", "图像", "语音", "multimodal", "vision", "video", "audio", "speech"] },
    { slug: "infra", words: ["基础设施", "算力", "gpu", "芯片", "推理成本", "infra", "cluster", "tpu", "nvidia", "部署"] },
    { slug: "safety", words: ["安全", "对齐", "风险", "滥用", "safety", "alignment", "guardrail", "jailbreak", "red team"] },
    { slug: "robotics", words: ["机器人", "具身", "robot", "embodied", "humanoid", "manipulation"] },
  ];

  for (const rule of rules) {
    if (rule.words.some((word) => haystack.includes(word))) {
      topics.push(rule.slug);
    }
  }

  return [...new Set(topics)].slice(0, 4);
}

const SECTION_REASON: Record<SectionSlug, string> = {
  models: "它涉及模型能力或权重变化，可能影响技术选型与后续研发节奏。",
  products: "它涉及产品功能与可用性变化，可能影响日常工具链与使用成本。",
  industry: "它反映资本、政策或竞争格局变化，可能影响行业走向与企业采购预期。",
  papers: "它涉及研究方法或评测结论，可能影响技术判断与实验设计。",
  insights: "它提供可复用的实践经验，可能直接影响落地效率与工程决策。",
};

const TOPIC_REASON: Record<string, string> = {
  funding: "涉及融资与资本动向",
  opensource: "涉及开源生态与可获取性",
  benchmark: "涉及评测基准与效果对比",
  agent: "涉及 Agent 与工具调用能力",
  multimodal: "涉及多模态输入输出能力",
  infra: "涉及算力与基础设施成本",
  safety: "涉及安全对齐与合规风险",
  robotics: "涉及具身智能与机器人落地",
};

/**
 * 生成"为什么重要"——规则化叙述，零 LLM 成本。
 * 迁移自旧项目的 whyItMatters 思路：让读者一眼判断是否需要点开。
 */
export function buildWhyItMatters(input: {
  section: SectionSlug;
  topics: string[];
  sourceName: string;
  heatScore: number;
}): string {
  const { section, topics, sourceName, heatScore } = input;
  const base = SECTION_REASON[section];

  if (topics.length === 0) {
    return `${base}（来源：${sourceName}，热度 ${heatScore}）`;
  }

  const names = topics
    .map((slug) => TOPIC_DEFS.find((topic) => topic.slug === slug)?.name)
    .filter(Boolean)
    .join("、");

  const extra = topics
    .slice(0, 2)
    .map((slug) => TOPIC_REASON[slug])
    .filter(Boolean)
    .join("，");

  return `${base}本条${extra ? `${extra}，` : ""}标签：${names}。（来源：${sourceName}）`;
}

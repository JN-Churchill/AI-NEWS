import fs from "fs";
import path from "path";
import { candidatePoolSchema, type CandidateItem } from "../src/lib/candidate-schema";
import { categoryNames } from "../src/lib/categories";
import { dailyIssueSchema, type DailyIssue, type SignalMetrics } from "../src/lib/issue-schema";

const args = process.argv.slice(2);

function getArg(name: string, fallback = "") {
  const index = args.indexOf(name);

  if (index >= 0) {
    return args[index + 1] ?? fallback;
  }

  const inline = args.find((arg) => arg.startsWith(`${name}=`));
  return inline ? inline.slice(name.length + 1) : fallback;
}

const date = getArg("--date", args.find((arg) => /^\d{4}-\d{2}-\d{2}$/.test(arg)) ?? new Date().toISOString().slice(0, 10));
const limit = Number(getArg("--limit", "8"));
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");

if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error("Usage: npm run issue:from-candidates -- --date YYYY-MM-DD [--limit 8] [--dry-run] [--force]");
  process.exit(1);
}

const candidatesPath = path.join(process.cwd(), "content", "candidates", `${date}.json`);
const issuesDirectory = path.join(process.cwd(), "content", "issues");
const issuePath = path.join(issuesDirectory, `${date}.json`);

if (!fs.existsSync(candidatesPath)) {
  console.error(`${path.relative(process.cwd(), candidatesPath)} does not exist. Run npm run ingest first.`);
  process.exit(1);
}

if (!dryRun && fs.existsSync(issuePath) && !force) {
  console.error(`${path.relative(process.cwd(), issuePath)} already exists. Use --force to overwrite.`);
  process.exit(1);
}

function cleanSummary(candidate: CandidateItem) {
  const summary = candidate.summary.trim();

  if (summary.length >= 30 && !/页面抓取候选|等待人工复核/.test(summary)) {
    return summary;
  }

  return `来自 ${candidate.sourceName} 的信号：「${candidate.title}」。该条目已经保留原始来源，发布前建议补充更完整的事实摘要和上下文。`;
}

function whyItMatters(candidate: CandidateItem) {
  const haystack = `${candidate.title} ${candidate.summary} ${candidate.tags.join(" ")}`.toLowerCase();
  const reasons = [
    {
      keywords: ["agent", "agents", "tool use", "workflow", "automation", "copilot"],
      text: "它可能改变 AI 应用从问答走向可执行工作流的边界，适合产品和工程团队优先复核。",
    },
    {
      keywords: ["benchmark", "eval", "sota", "state-of-the-art", "dataset"],
      text: "它涉及评测或基准变化，可能影响模型选型、技术判断和后续实验设计。",
    },
    {
      keywords: ["api", "sdk", "pricing", "launch", "release", "preview", "beta"],
      text: "它已经接近可用产品或开发者入口，可能直接影响团队的集成成本和路线选择。",
    },
    {
      keywords: ["funding", "series", "valuation", "s-1", "acquisition", "revenue"],
      text: "它反映资本、收入或公司阶段变化，可能影响行业竞争格局和企业采购预期。",
    },
    {
      keywords: ["open source", "github", "local", "self-hosted", "llama", "mistral", "qwen"],
      text: "它可能降低自部署或二次开发门槛，值得观察社区采用速度和维护质量。",
    },
    {
      keywords: ["inference", "serving", "gpu", "latency", "throughput", "quantization"],
      text: "它触及推理成本、性能或部署可靠性，适合进入工程基础设施视野。",
    },
    {
      keywords: ["safety", "security", "privacy", "policy", "regulation", "alignment"],
      text: "它关系到安全、合规或信任边界，可能影响上线节奏和企业采购判断。",
    },
  ];
  const matched = reasons.find((reason) => reason.keywords.some((keyword) => haystack.includes(keyword)));

  if (matched) {
    return matched.text;
  }

  const categoryReason: Record<string, string> = {
    model: "模型能力变化会直接影响应用边界、成本结构和产品交互方式，值得优先复核。",
    product: "产品更新可以反映真实用户需求和商业化方向，适合纳入今日产品观察。",
    research: "研究信号有助于判断技术路线和评测标准的变化，需要关注是否能落到工程实践。",
    opensource: "开源项目可能降低开发门槛或改变工具链生态，适合跟踪社区采用速度。",
    business: "商业动作会影响市场格局、预算流向和团队选型，是判断行业阶段的重要信号。",
    infra: "基础设施变化会影响部署、推理成本和系统可靠性，适合进入工程团队视野。",
  };

  return categoryReason[candidate.category] ?? "这条内容可能影响 AI 从业者的产品、研发或业务判断，建议人工复核后决定是否发布。";
}

function allocateMetrics(score: number): SignalMetrics {
  const weights = [
    ["utility", 0.3, 30],
    ["novelty", 0.2, 20],
    ["impact", 0.2, 20],
    ["credibility", 0.15, 15],
    ["audience", 0.1, 10],
    ["freshness", 0.05, 5],
  ] as const;
  const metrics = Object.fromEntries(
    weights.map(([key, weight, max]) => [key, Math.min(max, Math.round(score * weight))]),
  ) as SignalMetrics;
  let diff = Math.round(score - Object.values(metrics).reduce((sum, value) => sum + value, 0));

  while (diff !== 0) {
    let changed = false;

    for (const [key, , max] of weights) {
      if (diff > 0 && metrics[key] < max) {
        metrics[key] += 1;
        diff -= 1;
        changed = true;
      }

      if (diff < 0 && metrics[key] > 0) {
        metrics[key] -= 1;
        diff += 1;
        changed = true;
      }

      if (diff === 0) {
        break;
      }
    }

    if (!changed) {
      break;
    }
  }

  return metrics;
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}

const pool = candidatePoolSchema.parse(JSON.parse(fs.readFileSync(candidatesPath, "utf8")));
const ranked = pool.items
  .filter((item) => item.title && item.url)
  .sort((a, b) => b.score - a.score || new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

function selectDiverseCandidates(candidates: CandidateItem[]) {
  const selected: CandidateItem[] = [];
  const sourceCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();

  for (const candidate of candidates) {
    const sourceCount = sourceCounts.get(candidate.sourceId) ?? 0;
    const categoryCount = categoryCounts.get(candidate.category) ?? 0;

    if (sourceCount >= 2 || categoryCount >= Math.max(3, Math.ceil(limit * 0.5))) {
      continue;
    }

    selected.push(candidate);
    sourceCounts.set(candidate.sourceId, sourceCount + 1);
    categoryCounts.set(candidate.category, categoryCount + 1);

    if (selected.length >= limit) {
      return selected;
    }
  }

  for (const candidate of candidates) {
    if (!selected.some((item) => item.id === candidate.id)) {
      selected.push(candidate);
    }

    if (selected.length >= limit) {
      break;
    }
  }

  return selected;
}

const selected = selectDiverseCandidates(ranked);

if (selected.length === 0) {
  console.error("No candidates available to build an issue.");
  process.exit(1);
}

const categories = Array.from(new Set(selected.map((item) => item.category))).map((category) => {
  const items = selected.filter((item) => item.category === category);

  return {
    slug: category,
    name: categoryNames[category] ?? category,
    score: Math.round(average(items.map((item) => item.score))),
    count: items.length,
  };
});

const issue: DailyIssue = dailyIssueSchema.parse({
  date,
  issueNo: date.replaceAll("-", "."),
  status: "draft",
  title: "AI 信号指数日报",
  summary: `本期从 ${pool.itemCount} 条候选信号中筛出 ${selected.length} 条，覆盖 ${categories.map((category) => category.name).join("、")} 等方向，等待人工复核后发布。`,
  totalScore: average(selected.map((item) => item.score)),
  candidateCount: pool.itemCount,
  selectedCount: selected.length,
  readingMinutes: Math.max(4, Math.ceil(selected.length * 1.2)),
  categories,
  items: selected.map((candidate, index) => ({
    rank: index + 1,
    title: candidate.title,
    summary: cleanSummary(candidate),
    whyItMatters: whyItMatters(candidate),
    category: candidate.category,
    tags: candidate.tags.length > 0 ? candidate.tags : [categoryNames[candidate.category] ?? "AI"],
    source: candidate.sourceName,
    sourceUrl: candidate.url,
    publishedAt: candidate.publishedAt,
    score: Math.round(candidate.score),
    metrics: allocateMetrics(Math.round(candidate.score)),
  })),
});

if (dryRun) {
  console.log(JSON.stringify(issue, null, 2));
  process.exit(0);
}

fs.mkdirSync(issuesDirectory, { recursive: true });
fs.writeFileSync(issuePath, `${JSON.stringify(issue, null, 2)}\n`, "utf8");
console.log(`Created ${path.relative(process.cwd(), issuePath)} from ${path.relative(process.cwd(), candidatesPath)}`);

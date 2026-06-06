import fs from "fs";
import path from "path";
import { candidatePoolSchema } from "../src/lib/candidate-schema";
import { dailyIssueSchema } from "../src/lib/issue-schema";
import { getPublicIssueQualityErrors } from "./issue-quality";

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
const dryRun = args.includes("--dry-run");
const outputPath = getArg("--output", path.join("content", "reports", `${date}.md`));
const candidatesPath = path.join(process.cwd(), "content", "candidates", `${date}.json`);
const issuePath = path.join(process.cwd(), "content", "issues", `${date}.json`);
const fullOutputPath = path.isAbsolute(outputPath) ? outputPath : path.join(process.cwd(), outputPath);

if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error("Usage: npm run draft:summary -- --date YYYY-MM-DD [--dry-run] [--output path]");
  process.exit(1);
}

if (!fs.existsSync(candidatesPath)) {
  console.error(`${path.relative(process.cwd(), candidatesPath)} does not exist.`);
  process.exit(1);
}

if (!fs.existsSync(issuePath)) {
  console.error(`${path.relative(process.cwd(), issuePath)} does not exist.`);
  process.exit(1);
}

const pool = candidatePoolSchema.parse(JSON.parse(fs.readFileSync(candidatesPath, "utf8")));
const issue = dailyIssueSchema.parse(JSON.parse(fs.readFileSync(issuePath, "utf8")));
const publicQualityErrors = getPublicIssueQualityErrors(issue);
const sourceCounts = pool.sourceResults.reduce(
  (counts, result) => {
    counts[result.status] += 1;
    return counts;
  },
  { failed: 0, ok: 0, skipped: 0 },
);
const failedSources = pool.sourceResults.filter((result) => result.status !== "ok");
const topCandidates = [...pool.items].sort((a, b) => b.score - a.score).slice(0, 10);

function tableRow(values: Array<string | number>) {
  return `| ${values.map((value) => String(value).replace(/\|/g, "\\|")).join(" | ")} |`;
}

const report = [
  `# AI 信号指数日报草稿报告 ${date}`,
  "",
  "## 概览",
  "",
  `- 日报状态：${issue.status}`,
  `- 候选总数：${pool.itemCount}`,
  `- 入选条数：${issue.selectedCount}`,
  `- 来源覆盖：${sourceCounts.ok} 成功 / ${sourceCounts.failed} 失败 / ${sourceCounts.skipped} 跳过`,
  `- 阅读时长：${issue.readingMinutes} 分钟`,
  `- 值得读指数：${issue.totalScore}`,
  `- 公开发布门禁：${publicQualityErrors.length === 0 ? "通过" : `${publicQualityErrors.length} 项阻塞`}`,
  "",
  "## 分类分布",
  "",
  tableRow(["分类", "条数", "均分"]),
  tableRow(["---", "---:", "---:"]),
  ...issue.categories.map((category) => tableRow([category.name, category.count, category.score])),
  "",
  "## 入选信号",
  "",
  tableRow(["#", "分数", "分类", "来源", "标题"]),
  tableRow(["---:", "---:", "---", "---", "---"]),
  ...issue.items.map((item) => tableRow([item.rank, item.score, item.category, item.source, item.title])),
  "",
  "## 候选池 Top 10",
  "",
  tableRow(["分数", "来源", "分类", "标题"]),
  tableRow(["---:", "---", "---", "---"]),
  ...topCandidates.map((item) => tableRow([Math.round(item.score), item.sourceName, item.category, item.title])),
  "",
  "## 来源异常",
  "",
  failedSources.length > 0
    ? failedSources.map((source) => `- ${source.sourceName}: ${source.status}${source.message ? ` - ${source.message}` : ""}`).join("\n")
    : "- 无",
  "",
  "## 公开发布门禁",
  "",
  publicQualityErrors.length > 0
    ? publicQualityErrors.map((error) => `- ${error}`).join("\n")
    : "- 无阻塞项，可进入发布流程。",
  "",
  "## 发布前检查",
  "",
  "- 核对每条入选信号的原文链接是否可打开。",
  "- 改写机器生成或过长的摘要，避免内部采集话术进入公开日报。",
  "- 确认分类、标签、排序和 whyItMatters 是否符合编辑判断。",
  "- 发布前运行：`npm run issue:publish -- YYYY-MM-DD && npm run issue:validate && npm run site:audit && npm test && npm run lint && npm run build`。",
  "",
].join("\n");

if (dryRun) {
  console.log(report);
  process.exit(0);
}

fs.mkdirSync(path.dirname(fullOutputPath), { recursive: true });
fs.writeFileSync(fullOutputPath, report, "utf8");
console.log(`Created ${path.relative(process.cwd(), fullOutputPath)}`);

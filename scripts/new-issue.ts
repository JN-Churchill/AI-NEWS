import fs from "fs";
import path from "path";
import { dailyIssueSchema, type DailyIssue } from "../src/lib/issue-schema";

const dateArg = process.argv[2];
const today = new Date().toISOString().slice(0, 10);
const date = dateArg ?? today;

if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error("Usage: npm run issue:new -- YYYY-MM-DD");
  process.exit(1);
}

const issuesDirectory = path.join(process.cwd(), "content", "issues");
const filePath = path.join(issuesDirectory, `${date}.json`);
const dryRun = process.argv.includes("--dry-run");

if (!dryRun && fs.existsSync(filePath) && !process.argv.includes("--force")) {
  console.error(`${path.relative(process.cwd(), filePath)} already exists. Use --force to overwrite.`);
  process.exit(1);
}

const publishedAt = `${date}T09:00:00+08:00`;

const draft: DailyIssue = {
  date,
  issueNo: date.replaceAll("-", "."),
  status: "draft",
  title: "AI 信号指数日报",
  summary: "今日日报草稿，等待采集、摘要、评分和人工复核后发布。",
  totalScore: 70,
  candidateCount: 0,
  selectedCount: 3,
  readingMinutes: 5,
  categories: [
    { slug: "model", name: "模型", score: 70, count: 1 },
    { slug: "product", name: "产品", score: 70, count: 1 },
    { slug: "opensource", name: "开源", score: 70, count: 1 },
  ],
  items: [
    {
      rank: 1,
      title: "待补充：今日最重要的模型或能力更新",
      summary: "补充一句话摘要，说明发生了什么、来自哪里、当前可信度如何。",
      whyItMatters: "补充为什么值得读者关注，以及可能影响哪些产品、研发或业务判断。",
      category: "model",
      tags: ["待复核"],
      source: "待补充来源",
      sourceUrl: "",
      publishedAt,
      score: 70,
      metrics: {
        utility: 20,
        novelty: 15,
        impact: 15,
        credibility: 12,
        audience: 5,
        freshness: 3,
      },
    },
    {
      rank: 2,
      title: "待补充：今日最值得看的 AI 产品信号",
      summary: "补充产品更新、功能变化或商业化动作的简短摘要。",
      whyItMatters: "补充这条信号对用户体验、市场竞争或团队选型的意义。",
      category: "product",
      tags: ["待复核"],
      source: "待补充来源",
      sourceUrl: "",
      publishedAt,
      score: 70,
      metrics: {
        utility: 21,
        novelty: 14,
        impact: 14,
        credibility: 12,
        audience: 6,
        freshness: 3,
      },
    },
    {
      rank: 3,
      title: "待补充：今日值得追踪的开源项目",
      summary: "补充仓库、框架或工具链变化，并说明它解决了什么工程问题。",
      whyItMatters: "补充它是否可能降低开发成本、改变部署方式或形成新生态。",
      category: "opensource",
      tags: ["待复核"],
      source: "待补充来源",
      sourceUrl: "",
      publishedAt,
      score: 70,
      metrics: {
        utility: 20,
        novelty: 14,
        impact: 15,
        credibility: 12,
        audience: 6,
        freshness: 3,
      },
    },
  ],
};

const issue = dailyIssueSchema.parse(draft);

if (dryRun) {
  console.log(JSON.stringify(issue, null, 2));
  process.exit(0);
}

fs.mkdirSync(issuesDirectory, { recursive: true });
fs.writeFileSync(filePath, `${JSON.stringify(issue, null, 2)}\n`, "utf8");
console.log(`Created ${path.relative(process.cwd(), filePath)}`);

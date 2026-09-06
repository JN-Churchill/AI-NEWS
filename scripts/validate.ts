import fs from "node:fs";
import path from "node:path";

import { dailyIssueSchema, SECTION_DEFS, type DailyIssue } from "../src/types/schema";

/**
 * 发布门禁：校验所有日报的数据契约与业务规则。
 * 任何一条不满足就退出码 1，阻止脏数据进入构建。
 */

const ISSUES_DIR = path.join(process.cwd(), "content", "issues");

// 只拦截明确的内部/占位话术，避免误伤正常新闻里出现的常见词（例如"内部改革"）
const FORBIDDEN_PHRASES = ["待补充", "TODO", "占位", "xxx", "草稿", "测试数据", "示例条目"];

function validateIssue(issue: DailyIssue, date: string): string[] {
  const problems: string[] = [];

  if (issue.date !== date) {
    problems.push(`${date}: 文件名与 date 字段不一致（${issue.date}）`);
  }

  const allItems = issue.sections.flatMap((section) => section.items);

  if (allItems.length !== issue.stats.total) {
    problems.push(`${date}: stats.total ${issue.stats.total} 与实际条目数 ${allItems.length} 不一致`);
  }

  for (const section of issue.sections) {
    const definition = SECTION_DEFS.find((item) => item.slug === section.slug);
    if (!definition) {
      problems.push(`${date}: 未知版块 ${section.slug}`);
    }

    const heats = section.items.map((item) => item.heatScore);
    for (let i = 1; i < heats.length; i += 1) {
      if ((heats[i - 1] ?? 0) < (heats[i] ?? 0)) {
        problems.push(`${date}: 版块 ${section.slug} 内条目未按热度降序排列`);
        break;
      }
    }
  }

  for (const item of allItems) {
    if (!/^https?:\/\//.test(item.url)) {
      problems.push(`${date}: 条目「${item.title.slice(0, 24)}」链接无效`);
    }
    if (!item.title.trim() || !item.summary.trim()) {
      problems.push(`${date}: 条目「${item.title.slice(0, 24)}」标题或摘要为空`);
    }
    if (item.heatScore < 0 || item.heatScore > 100) {
      problems.push(`${date}: 条目「${item.title.slice(0, 24)}」热度越界 ${item.heatScore}`);
    }
    for (const phrase of FORBIDDEN_PHRASES) {
      if (item.title.includes(phrase) || item.summary.includes(phrase) || item.whyItMatters.includes(phrase)) {
        problems.push(`${date}: 条目「${item.title.slice(0, 24)}」包含内部话术「${phrase}」`);
      }
    }
  }

  const bySectionTotal = issue.stats.bySection.reduce((sum, entry) => sum + entry.count, 0);
  if (bySectionTotal !== issue.stats.total) {
    problems.push(`${date}: bySection 计数合计 ${bySectionTotal} 与 total ${issue.stats.total} 不一致`);
  }

  return problems;
}

export function runValidate(): { problems: string[]; fileCount: number } {
  if (!fs.existsSync(ISSUES_DIR)) {
    return { problems: ["没有 content/issues 目录，请先生成日报"], fileCount: 0 };
  }

  const files = fs.readdirSync(ISSUES_DIR).filter((file) => file.endsWith(".json"));
  const problems: string[] = [];

  for (const file of files) {
    const date = file.replace(/\.json$/, "");
    const raw = JSON.parse(fs.readFileSync(path.join(ISSUES_DIR, file), "utf8")) as unknown;
    const parsed = dailyIssueSchema.safeParse(raw);

    if (!parsed.success) {
      problems.push(`${date}: schema 校验失败 —— ${parsed.error.message}`);
      continue;
    }

    problems.push(...validateIssue(parsed.data, date));
  }

  return { problems, fileCount: files.length };
}

// 仅在 CLI 直接运行时执行
const isDirectRun = (process.argv[1] ?? "").replace(/\\/g, "/").endsWith("/validate.ts");
if (isDirectRun) {
  const { problems, fileCount } = runValidate();
  if (problems.length > 0) {
    console.error(`[validate] 发现 ${problems.length} 个问题：`);
    for (const problem of problems) {
      console.error(`  - ${problem}`);
    }
    process.exit(1);
  }
  console.log(`[validate] 通过：${fileCount} 期日报全部符合发布标准。`);
}

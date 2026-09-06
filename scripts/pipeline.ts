import fs from "node:fs";
import path from "node:path";

import { runIngest } from "./ingest";
import { runBuildIssue } from "./build-issue";
import { runValidate } from "./validate";
import { runBuildIndex } from "./build-index";
import { runEmitFeeds } from "./emit-feeds";

/**
 * 自动流水线：确保"今天"的日报存在。
 * 已存在 → 跳过；不存在 → 采集 → 生成 → 校验 → 建索引 → 出 Feed。
 * 供 src/instrumentation.ts 在 dev 启动时自动调用，也可手动触发。
 */

/** 北京时间今天 */
function bjtToday(): string {
  return new Date(Date.now() + 8 * 3_600_000).toISOString().slice(0, 10);
}

export type EnsureResult = "exists" | "generated" | "skipped";

export async function ensureTodayIssue(options: { force?: boolean } = {}): Promise<EnsureResult> {
  // CI / 生产构建里显式跳过（数据由 GitHub Actions 提交到仓库，构建时保持一致）
  if (process.env.SKIP_AUTO_INGEST === "1") {
    console.log("[pipeline] SKIP_AUTO_INGEST=1，跳过自动采集。");
    return "skipped";
  }

  const date = bjtToday();
  const issuePath = path.join(process.cwd(), "content", "issues", `${date}.json`);

  if (!options.force && fs.existsSync(issuePath)) {
    console.log(`[pipeline] 今日日报 ${date} 已存在，跳过自动采集。`);
    return "exists";
  }

  console.log(`[pipeline] 今日日报 ${date} 不存在，开始自动抓取生成（首次约 1 分钟）…`);

  await runIngest({ date });
  runBuildIssue({ date });

  const { problems } = runValidate();
  if (problems.length > 0) {
    console.error(`[pipeline] 校验未通过（${problems.length} 个问题）：`, problems.slice(0, 5).join("；"));
    throw new Error("日报校验未通过，已停止发布");
  }

  runBuildIndex();
  runEmitFeeds();

  console.log(`[pipeline] 今日日报 ${date} 已自动生成完毕。`);
  return "generated";
}

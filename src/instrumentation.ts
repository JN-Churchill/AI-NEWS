/**
 * Next.js 服务启动钩子：dev 模式下自动确保今天的日报存在。
 *
 * - `npm run dev` 启动时检查 content/issues/<今天>.json：
 *   不存在则自动执行 采集 → 生成 → 校验 → 索引 → Feed 全流程
 *   已存在则直接跳过，不重复抓取
 * - 生产构建（Vercel / GitHub Actions）自动跳过，数据以仓库提交为准
 * - 设置环境变量 SKIP_AUTO_INGEST=1 可随时禁用
 *
 * 采集失败不阻断站点启动：页面仍可访问历史数据。
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NODE_ENV !== "development") return;

  try {
    const { ensureTodayIssue } = await import("../scripts/pipeline");
    const result = await ensureTodayIssue();
    if (result === "generated") {
      console.log("[pipeline] 自动流水线执行完成，刷新页面即可看到今日日报。");
    }
  } catch (error) {
    console.error(
      "[pipeline] 自动采集失败（不影响站点启动，历史数据仍可访问）：",
      error instanceof Error ? error.message : error,
    );
  }
}

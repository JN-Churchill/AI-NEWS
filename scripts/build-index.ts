import fs from "node:fs";
import path from "node:path";

import { dailyIssueSchema, searchIndexSchema, type SearchEntry } from "../src/types/schema";

/**
 * 构建搜索索引：把所有日报条目摊平成一份静态 JSON，供搜索页与主题页使用。
 */

const ISSUES_DIR = path.join(process.cwd(), "content", "issues");
const OUT_DIR = path.join(process.cwd(), "content", "index");

export function runBuildIndex() {
  if (!fs.existsSync(ISSUES_DIR)) {
    throw new Error("没有 content/issues 目录，请先生成日报");
  }

  const files = fs
    .readdirSync(ISSUES_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort();

  const entries: SearchEntry[] = [];
  const dates: string[] = [];

  for (const file of files) {
    const date = file.replace(/\.json$/, "");
    const parsed = dailyIssueSchema.safeParse(
      JSON.parse(fs.readFileSync(path.join(ISSUES_DIR, file), "utf8")),
    );
    if (!parsed.success) {
      console.error(`[index] 跳过校验失败的日报 ${date}`);
      continue;
    }

    dates.push(date);
    for (const section of parsed.data.sections) {
      for (const item of section.items) {
        entries.push({
          id: item.id,
          date,
          title: item.title,
          summary: item.summary,
          url: item.url,
          sourceName: item.sourceName,
          section: item.section,
          topics: item.topics,
          heatScore: item.heatScore,
        });
      }
    }
  }

  const index = searchIndexSchema.parse({
    generatedAt: new Date().toISOString(),
    total: entries.length,
    dates: dates.reverse(),
    entries,
  });

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, "search-index.json");
  fs.writeFileSync(outPath, `${JSON.stringify(index, null, 2)}\n`);

  console.log(`[index] 已生成 ${outPath}：${index.total} 条条目，覆盖 ${index.dates.length} 期日报。`);
}

// 仅在 CLI 直接运行时执行
const isDirectRun = (process.argv[1] ?? "").replace(/\\/g, "/").endsWith("/build-index.ts");
if (isDirectRun) {
  try {
    runBuildIndex();
  } catch (error) {
    console.error("[index] 执行失败：", error);
    process.exit(1);
  }
}

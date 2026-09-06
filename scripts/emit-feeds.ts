import fs from "node:fs";
import path from "node:path";

import { dailyIssueSchema, TOPIC_DEFS, type DailyIssue } from "../src/types/schema";

/**
 * 生成 RSS、JSON Feed 与 sitemap，直接落到 public/ 供静态托管读取。
 * 站点地址通过环境变量 SITE_URL 配置，便于部署到 Vercel 或 GitHub Pages。
 */

const SITE_URL = (process.env["SITE_URL"] ?? "http://localhost:3000").replace(/\/$/, "");
const SITE_NAME = "AI 日报";
const SITE_DESC = "每天自动抓取全网 AI 热点，去重打分后生成一份五分钟读完的 AI 日报。";

const ISSUES_DIR = path.join(process.cwd(), "content", "issues");
const PUBLIC_DIR = path.join(process.cwd(), "public");

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function loadIssues(): DailyIssue[] {
  if (!fs.existsSync(ISSUES_DIR)) return [];

  return fs
    .readdirSync(ISSUES_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => dailyIssueSchema.safeParse(JSON.parse(fs.readFileSync(path.join(ISSUES_DIR, file), "utf8"))))
    .filter((result) => result.success)
    .map((result) => result.data)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

function buildRss(issues: DailyIssue[]): string {
  const items = issues
    .slice(0, 30)
    .map((issue) => {
      const title = `${issue.date} AI 日报 · ${issue.stats.total} 条热点`;
      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${SITE_URL}/daily/${issue.date}/</link>
      <guid isPermaLink="true">${SITE_URL}/daily/${issue.date}/</guid>
      <pubDate>${new Date(issue.generatedAt).toUTCString()}</pubDate>
      <description>${escapeXml(issue.lead)}</description>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}/</link>
    <description>${escapeXml(SITE_DESC)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

function buildJsonFeed(issues: DailyIssue[]): string {
  return `${JSON.stringify(
    {
      version: "https://jsonfeed.org/version/1.1",
      title: SITE_NAME,
      home_page_url: `${SITE_URL}/`,
      feed_url: `${SITE_URL}/feed.json`,
      description: SITE_DESC,
      language: "zh-CN",
      items: issues.slice(0, 30).map((issue) => ({
        id: `${SITE_URL}/daily/${issue.date}/`,
        url: `${SITE_URL}/daily/${issue.date}/`,
        title: `${issue.date} AI 日报 · ${issue.stats.total} 条热点`,
        summary: issue.lead,
        date_published: issue.generatedAt,
      })),
    },
    null,
    2,
  )}\n`;
}

function buildSitemap(issues: DailyIssue[]): string {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE_URL}/`, priority: "1.0" },
    { loc: `${SITE_URL}/archive/`, priority: "0.8" },
    { loc: `${SITE_URL}/search/`, priority: "0.6" },
    { loc: `${SITE_URL}/topics/`, priority: "0.7" },
    { loc: `${SITE_URL}/about/`, priority: "0.5" },
    ...TOPIC_DEFS.map((topic) => ({ loc: `${SITE_URL}/topics/${topic.slug}/`, priority: "0.5" })),
    ...issues.map((issue) => ({ loc: `${SITE_URL}/daily/${issue.date}/`, priority: "0.7" })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
}

function main() {
  const issues = loadIssues();

  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.writeFileSync(path.join(PUBLIC_DIR, "rss.xml"), buildRss(issues), "utf8");
  fs.writeFileSync(path.join(PUBLIC_DIR, "feed.json"), buildJsonFeed(issues), "utf8");
  fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), buildSitemap(issues), "utf8");

  console.log(`[feeds] 已生成 rss.xml / feed.json / sitemap.xml，共 ${issues.length} 期日报。`);
}

main();

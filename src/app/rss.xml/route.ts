import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import { getAllIssues } from "@/lib/issues";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(value: string) {
  return `<![CDATA[${value.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

export function GET() {
  const issues = getAllIssues();
  const items = issues
    .flatMap((issue) =>
      issue.items.map((item) => {
        const url = `${SITE_URL}/daily/${issue.date}#signal-${item.rank}`;
        const title = `${issue.date} #${item.rank} ${item.title}`;
        const description = [
          item.summary,
          item.whyItMatters,
          item.sourceUrl ? `原文：${item.sourceUrl}` : "",
        ]
          .filter(Boolean)
          .join("\n\n");

        return `
        <item>
          <title>${cdata(title)}</title>
          <link>${escapeXml(url)}</link>
          <guid>${escapeXml(url)}</guid>
          <description>${cdata(description)}</description>
          <pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate>
          <source url="${escapeXml(`${SITE_URL}/daily/${issue.date}`)}">${escapeXml(issue.title)}</source>
          ${item.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("")}
        </item>`;
      }),
    )
    .join("");

  const body = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>${escapeXml(SITE_NAME)}</title>
        <link>${escapeXml(SITE_URL)}</link>
        <atom:link href="${escapeXml(`${SITE_URL}/rss.xml`)}" rel="self" type="application/rss+xml" />
        <description>${escapeXml(SITE_DESCRIPTION)}</description>
        <lastBuildDate>${new Date(issues[0]?.date ? `${issues[0].date}T08:00:00+08:00` : Date.now()).toUTCString()}</lastBuildDate>
        ${items}
      </channel>
    </rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=3600",
    },
  });
}

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

export function GET() {
  const items = getAllIssues()
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
          <title><![CDATA[${title}]]></title>
          <link>${escapeXml(url)}</link>
          <guid>${escapeXml(url)}</guid>
          <description><![CDATA[${description}]]></description>
          <pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate>
          <source url="${escapeXml(`${SITE_URL}/daily/${issue.date}`)}">${escapeXml(issue.title)}</source>
          ${item.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("")}
        </item>`;
      }),
    )
    .join("");

  const body = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>${escapeXml(SITE_NAME)}</title>
        <link>${escapeXml(SITE_URL)}</link>
        <description>${escapeXml(SITE_DESCRIPTION)}</description>
        ${items}
      </channel>
    </rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}

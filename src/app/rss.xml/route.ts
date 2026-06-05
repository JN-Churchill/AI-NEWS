import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import { getAllIssues } from "@/lib/issues";

export function GET() {
  const issues = getAllIssues();
  const items = issues
    .map((issue) => {
      const url = `${SITE_URL}/daily/${issue.date}`;

      return `
        <item>
          <title><![CDATA[${issue.date} ${issue.title}]]></title>
          <link>${url}</link>
          <guid>${url}</guid>
          <description><![CDATA[${issue.summary}]]></description>
          <pubDate>${new Date(`${issue.date}T08:00:00+08:00`).toUTCString()}</pubDate>
        </item>`;
    })
    .join("");

  const body = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>${SITE_NAME}</title>
        <link>${SITE_URL}</link>
        <description>${SITE_DESCRIPTION}</description>
        ${items}
      </channel>
    </rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}

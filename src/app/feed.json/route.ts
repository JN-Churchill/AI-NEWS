import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import { getAllIssues } from "@/lib/issues";

export function GET() {
  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: SITE_NAME,
    home_page_url: SITE_URL,
    feed_url: `${SITE_URL}/feed.json`,
    description: SITE_DESCRIPTION,
    language: "zh-CN",
    items: getAllIssues().flatMap((issue) =>
      issue.items.map((item) => ({
        id: `${SITE_URL}/daily/${issue.date}#signal-${item.rank}`,
        url: `${SITE_URL}/daily/${issue.date}#signal-${item.rank}`,
        external_url: item.sourceUrl || undefined,
        title: `${issue.date} #${item.rank} ${item.title}`,
        summary: item.summary,
        content_text: [item.summary, item.whyItMatters, item.sourceUrl ? `原文：${item.sourceUrl}` : ""]
          .filter(Boolean)
          .join("\n\n"),
        date_published: item.publishedAt,
        tags: [...item.tags, issue.title, item.source],
      })),
    ),
  };

  return Response.json(feed);
}

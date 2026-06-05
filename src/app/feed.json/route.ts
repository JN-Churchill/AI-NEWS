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
    items: getAllIssues().map((issue) => ({
      id: `${SITE_URL}/daily/${issue.date}`,
      url: `${SITE_URL}/daily/${issue.date}`,
      title: `${issue.date} ${issue.title}`,
      summary: issue.summary,
      content_text: issue.items.map((item) => `${item.rank}. ${item.title} - ${item.summary}`).join("\n"),
      date_published: new Date(`${issue.date}T08:00:00+08:00`).toISOString(),
      tags: issue.categories.map((category) => category.name),
    })),
  };

  return Response.json(feed);
}

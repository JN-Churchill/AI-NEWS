import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getAllTopicSlugs } from "@/lib/catalog";
import { getAllIssues } from "@/lib/issues";
import { getAihotDates } from "@/lib/aihot";

export default function sitemap(): MetadataRoute.Sitemap {
  const issues = getAllIssues();
  const latestModified = issues[0]?.date ? new Date(`${issues[0].date}T08:00:00+08:00`) : new Date();
  const staticRoutes = ["", "/archive", "/briefing", "/about", "/topics", "/sources", "/search", "/subscribe", "/editorial", "/contact", "/privacy", "/terms"].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: latestModified,
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.7,
  }));

  const issueRoutes = issues.map((issue) => ({
    url: `${SITE_URL}/daily/${issue.date}`,
    lastModified: new Date(`${issue.date}T08:00:00+08:00`),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const topicRoutes = getAllTopicSlugs().map((slug) => ({
    url: `${SITE_URL}/topics/${slug}`,
    lastModified: latestModified,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const briefingRoutes = getAihotDates().map((date) => ({
    url: `${SITE_URL}/briefing/${date}`,
    lastModified: new Date(`${date}T08:00:00+08:00`),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...issueRoutes, ...topicRoutes, ...briefingRoutes];
}

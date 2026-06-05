import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getAllTopicSlugs } from "@/lib/catalog";
import { getAllIssues } from "@/lib/issues";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/archive", "/about", "/topics", "/sources", "/search", "/editorial", "/contact"].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));

  const issueRoutes = getAllIssues().map((issue) => ({
    url: `${SITE_URL}/daily/${issue.date}`,
    lastModified: new Date(`${issue.date}T08:00:00+08:00`),
  }));

  const topicRoutes = getAllTopicSlugs().map((slug) => ({
    url: `${SITE_URL}/topics/${slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...issueRoutes, ...topicRoutes];
}

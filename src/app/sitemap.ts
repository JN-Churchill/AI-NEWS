import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getAllIssues } from "@/lib/issues";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/archive", "/about"].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));

  const issueRoutes = getAllIssues().map((issue) => ({
    url: `${SITE_URL}/daily/${issue.date}`,
    lastModified: new Date(`${issue.date}T08:00:00+08:00`),
  }));

  return [...staticRoutes, ...issueRoutes];
}

import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getAllProjects } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/services`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/work`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE.url}/contact`, changeFrequency: "yearly", priority: 0.6 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = getAllProjects().map((p) => ({
    url: `${SITE.url}/work/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes];
}

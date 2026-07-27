import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getAllProjects } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/about`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/services`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/work`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/contact`, lastModified, changeFrequency: "yearly", priority: 0.6 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = getAllProjects().map((p) => ({
    url: `${SITE.url}/work/${p.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes];
}

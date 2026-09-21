import type { MetadataRoute } from "next";
import { articles, openSourceSeries } from "@/lib/editorial";
import { SITE } from "@/lib/site";
import { getAllProjects } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/services`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/work`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/demos`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/contact`, changeFrequency: "yearly", priority: 0.6 },
    {
      url: `${SITE.url}/ars-pocket/privacy`,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = getAllProjects().map((p) => ({
    url: `${SITE.url}/work/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes,
    { url: `${SITE.url}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE.url}${openSourceSeries.href}`, changeFrequency: "weekly", priority: 0.7 },
    ...articles.map((article) => ({ url: `${SITE.url}${article.href}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { z } from "zod";

const projectSchema = z.object({
  title:       z.string(),
  summary:     z.string(),
  cover:       z.string().optional(),
  tags:        z.array(z.string()).optional(),
  role:        z.string().optional(),
  year:        z.number().optional(),
  client:      z.string().optional(),
  featured:    z.boolean().optional(),
  // Link to the real, live product. Only set this when the URL is verified —
  // never fabricate a live link for a project that isn't actually deployed.
  liveUrl:     z.string().url().optional(),
  // Optional extra visual evidence beyond the cover image. Like `cover`,
  // these must be real screenshots of the shipped product — never mockups
  // or placeholders presented as if they were the real thing.
  screenshots: z.array(z.string()).optional(),
});

// NOTE: Any outcome/result claim in a project's MDX body (metrics, sales
// numbers, "in active use", etc.) must be verified and approved by the
// client before publishing. Do not invent or round up numbers.
export type ProjectMeta = z.infer<typeof projectSchema> & { slug: string };

const PROJECTS_DIR = path.join(process.cwd(), "content/projects");

export function getAllProjects(): ProjectMeta[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];

  const files = fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const slug = file.replace(".mdx", "");
      const raw = fs.readFileSync(path.join(PROJECTS_DIR, file), "utf-8");
      const { data } = matter(raw);
      const parsed = projectSchema.safeParse(data);
      if (!parsed.success) {
        console.warn(`[projects] Invalid frontmatter in ${file}:`, parsed.error.flatten());
        return null;
      }
      return { slug, ...parsed.data } satisfies ProjectMeta;
    })
    .filter((p): p is ProjectMeta => p !== null)
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
}

export function getProjectBySlug(slug: string): { meta: ProjectMeta; content: string } | null {
  const filePath = path.join(PROJECTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const parsed = projectSchema.safeParse(data);
  if (!parsed.success) {
    console.warn(`[projects] Invalid frontmatter in ${slug}.mdx:`, parsed.error.flatten());
    return null;
  }
  return { meta: { slug, ...parsed.data }, content };
}

export function getFeaturedProjects(): ProjectMeta[] {
  return getAllProjects().filter((p) => p.featured === true);
}

/** Homepage showcase: featured first, then fill up to `limit` (single row). */
export function getHomepageProjects(limit = 3): ProjectMeta[] {
  const all = getAllProjects();
  const featured = all.filter((p) => p.featured);
  const rest = all.filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, limit);
}

import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface ProjectMeta {
  slug: string;
  title: string;
  summary: string;
  cover?: string;
  tags?: string[];
  role?: string;
  year?: number;
  client?: string;
  featured?: boolean;
}

const PROJECTS_DIR = path.join(process.cwd(), "content/projects");

export function getAllProjects(): ProjectMeta[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];

  const files = fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const slug = file.replace(".mdx", "");
      const raw = fs.readFileSync(path.join(PROJECTS_DIR, file), "utf-8");
      const { data } = matter(raw);
      return { slug, ...data } as ProjectMeta;
    })
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
}

export function getProjectBySlug(slug: string): { meta: ProjectMeta; content: string } | null {
  const filePath = path.join(PROJECTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return { meta: { slug, ...data } as ProjectMeta, content };
}

export function getFeaturedProjects(): ProjectMeta[] {
  return getAllProjects().filter((p) => p.featured);
}

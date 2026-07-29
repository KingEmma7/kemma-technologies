import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { z } from "zod";
import { PRODUCTS, type Product } from "./products";

/**
 * What kind of work a project is. A project can be more than one — ISGM is both
 * a platform and institutional work — so this is a list, not a single value.
 */
export const PROJECT_CATEGORIES = [
  "platform",
  "website",
  "commerce",
  "institutional",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

/**
 * Delivery status. `in-development` must be used for anything not yet publicly
 * usable — never present unfinished work as shipped.
 */
export const PROJECT_STATUSES = ["live", "in-development"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

const projectSchema = z.object({
  title:       z.string(),
  summary:     z.string(),
  cover:       z.string().optional(),
  tags:        z.array(z.string()).optional(),
  role:        z.string().optional(),
  year:        z.number().optional(),
  client:      z.string().optional(),
  featured:    z.boolean().optional(),
  categories:  z.array(z.enum(PROJECT_CATEGORIES)).default([]),
  status:      z.enum(PROJECT_STATUSES).default("live"),
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

/**
 * A single entry in the Work index.
 *
 * Client platforms and Kemma-owned products are listed together so visitors can
 * filter across everything, but `owner` keeps the distinction explicit — client
 * work must never read as a Kemma product, or the reverse.
 *
 * Products have no case study, so `href` is optional: a card without one is not
 * a link to nowhere, it simply doesn't link.
 */
export interface WorkItem {
  id: string;
  title: string;
  summary: string;
  owner: "client" | "kemma";
  categories: readonly ProjectCategory[];
  status: ProjectStatus;
  year?: number;
  cover?: string;
  tags?: string[];
  liveUrl?: string;
  /** Case-study path, when one exists. */
  href?: string;
}

function projectToWorkItem(p: ProjectMeta): WorkItem {
  return {
    id: p.slug,
    title: p.title,
    summary: p.summary,
    owner: "client",
    categories: p.categories,
    status: p.status,
    year: p.year,
    cover: p.cover,
    tags: p.tags,
    liveUrl: p.liveUrl,
    href: `/work/${p.slug}`,
  };
}

function productToWorkItem(product: Product): WorkItem {
  return {
    id: product.id,
    title: product.name,
    summary: product.summary,
    owner: "kemma",
    categories: product.categories,
    status: product.status,
    liveUrl: product.href,
  };
}

/** Everything shown on the Work page: client projects first, then products. */
export function getWorkItems(): WorkItem[] {
  return [...getAllProjects().map(projectToWorkItem), ...PRODUCTS.map(productToWorkItem)];
}

/**
 * Homepage showcase: featured first, then fill up to `limit`.
 * Pass `exclude` to omit projects that already have a dedicated homepage slot
 * (e.g. the ISGM flagship section).
 */
export function getHomepageProjects(
  limit = 3,
  options: { exclude?: string[] } = {},
): ProjectMeta[] {
  const exclude = new Set(options.exclude ?? []);
  const all = getAllProjects().filter((p) => !exclude.has(p.slug));
  const featured = all.filter((p) => p.featured);
  const rest = all.filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, limit);
}

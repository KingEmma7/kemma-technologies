import type { ProjectCategory, ProjectStatus } from "./projects";

/**
 * Kemma-owned products shown on the homepage and the Work page.
 *
 * Status language must stay honest. Giveaways.live is in development — never
 * present it as live, complete, or widely used until that is actually true, and
 * do not add user numbers, traction or launch dates that don't exist.
 *
 * `status` and `categories` deliberately reuse the project vocabulary so the
 * Work index can filter products and client work through one set of controls.
 */
export interface Product {
  id: string;
  name: string;
  status: ProjectStatus;
  statusLabel: string;
  summary: string;
  categories: readonly ProjectCategory[];
  /** Only set once there is something real for a visitor to look at. */
  href?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "giveaways-live",
    name: "Giveaways.live",
    status: "in-development",
    statusLabel: "In Development",
    summary:
      "A multi-platform giveaway management product designed to help organisers create, manage and evaluate online giveaways more transparently.",
    categories: ["platform"],
  },
];

/**
 * Kemma-owned products shown on the homepage and (later) the Work page.
 *
 * Status language must stay honest. Giveaways.live is in development — never
 * present it as live, complete, or widely used until that is actually true.
 */
export type ProductStatus = "in-development" | "live";

export interface Product {
  id: string;
  name: string;
  status: ProductStatus;
  statusLabel: string;
  summary: string;
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
  },
];

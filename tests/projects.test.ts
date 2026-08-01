import { describe, expect, it } from "vitest";
import { getAllProjects, getWorkItems } from "../lib/projects";

describe("project content", () => {
  it("parses every project file and keeps slugs unique", () => {
    const projects = getAllProjects();
    const slugs = projects.map((project) => project.slug);

    expect(projects).toHaveLength(5);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("keeps client work distinct from Kemma-owned products", () => {
    const items = getWorkItems();

    expect(items.filter((item) => item.owner === "client")).toHaveLength(5);
    expect(items.filter((item) => item.owner === "kemma")).toHaveLength(1);
    expect(items.find((item) => item.id === "giveaways-live")?.status).toBe("in-development");
  });
});

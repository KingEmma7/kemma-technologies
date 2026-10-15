import { describe, expect, it } from "vitest";
import { replaceOriginalFiles, FileRecoveryError } from "../components/brief/recovery";
import { fileSpec } from "../lib/brief/schema";

const projectId = "168a6311-87dd-4de7-bffa-1b6923e67c21";
function draft(count = 45) {
  return {
    schemaVersion: 2, question: "finish", visited: ["brand", "products", "finish"],
    answers: { businessName: "Example Crochet", email: "client@example.com", permission: true, additionalNotes: "Keep all my answers" },
    products: [{ id: projectId, name: "Daisy tote", priceLabel: "GHS 150" }],
    files: Array.from({ length: count }, (_, index) => ({
      id: `168a6311-87dd-4de7-bffa-${String(index).padStart(12, "0")}`,
      scope: `product:${projectId}`, role: index === 0 ? "Main product photo" as const : "Additional file" as const,
      file: new File([new Uint8Array(20 + index).fill(index)], `photo-${index}.png`, { type: "image/png", lastModified: 10 }),
    })),
  };
}
function freshOriginal(file: File) {
  return new File([new Uint8Array(file.size)], file.name, { type: "application/octet-stream", lastModified: 20 });
}
function allocation(original: ReturnType<typeof draft>) {
  return original.files.map(({ id, scope, role, file }) => fileSpec({ id, scope, role, name: file.name, size: file.size, type: file.type }, projectId));
}

describe("reselecting original brief files", () => {
  it("replaces one unreadable handle while preserving all 45 IDs, roles, answers, products and allocation", () => {
    const original = draft();
    const replacement = freshOriginal(original.files[0].file);
    const result = replaceOriginalFiles(original, [replacement], original.files[0].id);
    expect(result.replacedIds).toEqual([original.files[0].id]);
    expect(result.draft.answers).toBe(original.answers);
    expect(result.draft.products).toBe(original.products);
    expect(result.draft.visited).toBe(original.visited);
    expect(result.draft.files).toHaveLength(45);
    expect(result.draft.files[0]).toEqual({ ...original.files[0], file: replacement });
    expect(result.draft.files[0].role).toBe("Main product photo");
    expect(result.draft.files.slice(1).every((entry, index) => entry === original.files[index + 1])).toBe(true);
    expect(allocation(result.draft)).toEqual(allocation(original));
    expect(original.files[0].file).not.toBe(replacement);
  });

  it("reselects several originals in any picker order without changing their displayed order or allocation count", () => {
    const original = draft(2), before = allocation(original);
    const replacementFirst = freshOriginal(original.files[0].file), replacementSecond = freshOriginal(original.files[1].file);
    const result = replaceOriginalFiles(original, [replacementSecond, replacementFirst], original.files[0].id);
    expect(result.draft.files.map(entry => entry.id)).toEqual(original.files.map(entry => entry.id));
    expect(result.draft.files.map(entry => entry.file)).toEqual([replacementFirst, replacementSecond]);
    expect(allocation(result.draft)).toEqual(before);
    expect(allocation(result.draft)).toHaveLength(2);
    expect(result.draft.answers).toBe(original.answers);
  });

  it.each(["name", "size"])("rejects a mismatched %s atomically after an earlier selection matched", changed => {
    const original = draft(2), first = freshOriginal(original.files[0].file), second = original.files[1].file;
    const wrong = new File([new Uint8Array(second.size + (changed === "size" ? 1 : 0))], changed === "name" ? "different.png" : second.name);
    const before = original.files.slice();
    expect(() => replaceOriginalFiles(original, [first, wrong], original.files[0].id)).toThrow(FileRecoveryError);
    expect(original.files).toEqual(before);
    expect(original.files[0].file).not.toBe(first);
    expect(original.answers.additionalNotes).toBe("Keep all my answers");
  });

  it("rejects an ambiguous original without changing any handles", () => {
    const original = draft(2);
    original.files[1].file = freshOriginal(original.files[0].file);
    const before = original.files.slice();
    expect(() => replaceOriginalFiles(original, [freshOriginal(original.files[0].file)])).toThrow("match more than one upload");
    expect(original.files).toEqual(before);
  });

  it("uses the failed ID to resolve one duplicate-name entry while preserving the other entry", () => {
    const original = draft(2);
    original.files[1].file = freshOriginal(original.files[0].file);
    const replacement = freshOriginal(original.files[1].file);
    const result = replaceOriginalFiles(original, [replacement], original.files[1].id);
    expect(result.draft.files[0]).toBe(original.files[0]);
    expect(result.draft.files[1]).toEqual({ ...original.files[1], file: replacement });
    expect(result.replacedIds).toEqual([original.files[1].id]);
    expect(allocation(result.draft)).toEqual(allocation(original));
  });

  it("rejects repeated selections atomically instead of assigning them to duplicate entries", () => {
    const original = draft(2), replacement = freshOriginal(original.files[0].file);
    expect(() => replaceOriginalFiles(original, [replacement, replacement], original.files[0].id)).toThrow("Choose each original file once");
    expect(original.files[0].file).not.toBe(replacement);
  });

  it("leaves the exact draft untouched when the picker is cancelled", () => {
    const original = draft();
    expect(replaceOriginalFiles(original, [], original.files[0].id)).toEqual({ draft: original, replacedIds: [] });
    expect(replaceOriginalFiles(original, []).draft).toBe(original);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDraftPersistence, readDraft } from "../components/brief/storage";

const invite = "test-invite-for-saved-client";
const database = "kemma-crochet-brief-v2-1c8647f3";
type RequestHandlers = { result?: unknown; error?: Error; onsuccess?: () => void; onerror?: () => void; onblocked?: () => void };
type TransactionHandlers = { error?: Error; oncomplete?: () => void; onerror?: () => void; onabort?: () => void };
let records: Map<string, unknown>;
let openFails: boolean;
let abortRead: boolean;
let holdRead: boolean;
let blockedOpen: boolean;
let failedWrites: number;
let completeRead: (() => void) | undefined;
let holdWriteRead: boolean;
let completeWriteRead: (() => void) | undefined;
let holdCommit: boolean;
let completeCommit: (() => void) | undefined;
let writes: string[];
let closed: number;
const openMock = vi.fn();

beforeEach(() => {
  records = new Map(); writes = []; closed = 0;
  openFails = abortRead = holdRead = blockedOpen = holdWriteRead = holdCommit = false; failedWrites = 0; completeRead = completeWriteRead = completeCommit = undefined;
  openMock.mockReset();
  const writing = new Set<string>();
  const queued = new Map<string, (() => void)[]>();
  const release = (name: string) => {
    writing.delete(name);
    const next = queued.get(name)?.shift();
    if (next) { writing.add(name); queueMicrotask(next); }
  };
  openMock.mockImplementation((name: string) => {
    const connection = {
      close: () => { closed += 1; },
      transaction: (_store: string, mode: string) => {
        let done = false, started = false;
        const finish = () => { if (!done) { done = true; if (started && mode === "readwrite") release(name); } };
        const transaction: TransactionHandlers & { objectStore: () => unknown; abort: () => void } = {
          abort: () => { if (done) return; finish(); transaction.onabort?.(); },
          objectStore: () => ({
            get: () => {
              const request: RequestHandlers = {};
              const complete = () => {
                if (done) return;
                request.result = records.get(name);
                request.onsuccess?.();
                if (mode === "readonly") {
                  if (abortRead) { transaction.error = new Error("Safari interrupted the read"); transaction.abort(); }
                  else { finish(); transaction.oncomplete?.(); }
                }
              };
              const start = () => {
                started = true;
                if (done) { if (mode === "readwrite") release(name); return; }
                if (mode === "readwrite" && holdWriteRead) completeWriteRead = complete;
                else if (mode === "readonly" && holdRead) completeRead = complete;
                else queueMicrotask(complete);
              };
              if (mode === "readwrite") {
                if (writing.has(name)) queued.set(name, [...(queued.get(name) || []), start]);
                else { writing.add(name); queueMicrotask(start); }
              } else queueMicrotask(start);
              return request;
            },
            put: (value: unknown) => {
              writes.push(name);
              const commit = () => {
                if (done) return;
                if (failedWrites > 0) {
                  failedWrites -= 1;
                  transaction.error = new Error("Storage is temporarily unavailable");
                  transaction.abort();
                } else { records.set(name, value); finish(); transaction.oncomplete?.(); }
              };
              if (holdCommit) completeCommit = commit; else queueMicrotask(commit);
            },
          }),
        };
        expect(["readonly", "readwrite"]).toContain(mode);
        return transaction;
      },
    };
    const request: RequestHandlers = { result: connection };
    queueMicrotask(() => {
      if (openFails) { request.error = new Error("Couldn’t open browser storage"); request.onerror?.(); }
      else if (blockedOpen) { request.onblocked?.(); queueMicrotask(() => request.onsuccess?.()); }
      else request.onsuccess?.();
    });
    return request;
  });
  vi.stubGlobal("indexedDB", { open: openMock });
});
afterEach(() => vi.unstubAllGlobals());

function savedDraft() {
  return {
    schemaVersion: 2, question: "finish", visited: ["brand", "contact", "finish"], editor: null, suspendedEditor: null,
    answers: { businessName: "Example Crochet", email: "client@example.com", permission: true, additionalNotes: "Keep the colours warm" },
    products: [{ id: "product-1", name: "Daisy tote", priceLabel: "GHS 150" }],
    files: Array.from({ length: 45 }, (_, index) => ({ id: `file-${index}`, scope: "product:product-1", role: "Additional file",
      file: new File([new Uint8Array(1024).fill(index + 1)], `photo-${index}.png`, { type: "image/png" }),
    })),
  };
}
const freshDraft = () => ({ schemaVersion: 2, question: "brand", answers: {}, products: [], files: [] });
const flush = async () => { for (let index = 0; index < 10; index += 1) await Promise.resolve(); };

describe("protecting saved brief drafts", () => {
  it("never replaces an existing draft after a failed restore, and retry restores all 45 originals", async () => {
    const original = savedDraft(); records.set(database, original);
    const persistence = createDraftPersistence(invite);
    openFails = true;
    await expect(persistence.restore()).rejects.toThrow("Couldn’t open browser storage");
    // Reproduce the previous UI's dangerous sequence: ready after read failure, then save empty state.
    await expect(persistence.save(freshDraft())).rejects.toThrow();
    expect(writes).toEqual([]);
    expect(records.get(database)).toBe(original);
    openFails = false;
    const restored = await persistence.restore();
    expect(restored).toEqual(original);
    expect(original.files).toHaveLength(45);
    for (const [index, entry] of original.files.entries()) {
      expect(new Uint8Array(await entry.file.arrayBuffer())).toEqual(new Uint8Array(1024).fill(index + 1));
    }
    await persistence.save({ ...original, answers: { ...original.answers, additionalNotes: "Updated note" } });
    expect(records.get(database)).toMatchObject({ answers: { businessName: "Example Crochet", additionalNotes: "Updated note" }, files: original.files });
    expect(openMock).toHaveBeenCalledWith(database, 1);
  });

  it("allows a new blank draft only after successfully confirming no saved draft exists", async () => {
    const persistence = createDraftPersistence(invite);
    await expect(persistence.save(freshDraft())).rejects.toThrow();
    expect(await persistence.restore()).toBeUndefined();
    await persistence.save(freshDraft());
    expect(records.get(database)).toMatchObject(freshDraft());
  });

  it.each([{ schemaVersion: 1, answers: { businessName: "Older client draft" } }, { schemaVersion: 2, answers: {}, products: [], files: null }, null])(
    "preserves incompatible saved data instead of silently starting over (%j)", async original => {
      records.set(database, original);
      const persistence = createDraftPersistence(invite);
      await expect(persistence.restore()).rejects.toThrow("could not be restored");
      await expect(persistence.save(freshDraft())).rejects.toThrow();
      expect(records.get(database)).toBe(original);
      expect(writes).toEqual([]);
    },
  );

  it("does not authorize writes when the read transaction aborts after returning its record", async () => {
    const original = savedDraft(); records.set(database, original); abortRead = true;
    const persistence = createDraftPersistence(invite);
    await expect(persistence.restore()).rejects.toThrow("Safari interrupted the read");
    await expect(persistence.save(freshDraft())).rejects.toThrow();
    expect(writes).toEqual([]);
    expect(records.get(database)).toBe(original);
    abortRead = false;
    await expect(persistence.restore()).resolves.toEqual(original);
  });

  it("blocks writes while restoration is still waiting for browser storage", async () => {
    const original = savedDraft(); records.set(database, original); holdRead = true;
    const persistence = createDraftPersistence(invite);
    const restoring = persistence.restore();
    await flush();
    await expect(persistence.save(freshDraft())).rejects.toThrow();
    expect(records.get(database)).toBe(original);
    completeRead!();
    await expect(restoring).resolves.toEqual(original);
    expect(writes).toEqual([]);
  });

  it("keeps queued saves in order and recovers from a temporary write failure without dropping files", async () => {
    const original = savedDraft(); records.set(database, original);
    const persistence = createDraftPersistence(invite); await persistence.restore(); failedWrites = 1;
    const first = persistence.save({ ...original, answers: { ...original.answers, additionalNotes: "First edit" } });
    const second = persistence.save({ ...original, answers: { ...original.answers, additionalNotes: "Latest edit" } });
    const outcomes = await Promise.allSettled([first, second]);
    expect(outcomes.map(outcome => outcome.status)).toEqual(["rejected", "fulfilled"]);
    expect(records.get(database)).toMatchObject({ answers: { additionalNotes: "Latest edit" }, files: original.files });
  });

  it("closes a connection that arrives after a blocked open, without permitting an empty overwrite", async () => {
    const original = savedDraft(); records.set(database, original); blockedOpen = true;
    const persistence = createDraftPersistence(invite);
    await expect(persistence.restore()).rejects.toThrow("Close other brief tabs");
    await flush();
    expect(closed).toBe(1);
    await expect(persistence.save(freshDraft())).rejects.toThrow();
    expect(records.get(database)).toBe(original);
    expect(writes).toEqual([]);
  });

  it("returns a draft only after the complete read transaction succeeds", async () => {
    records.set(database, savedDraft()); holdRead = true;
    const restoring = readDraft(invite);
    await flush();
    expect(closed).toBe(0);
    completeRead!();
    await expect(restoring).resolves.toMatchObject({ question: "finish" });
    expect(closed).toBe(1);
  });

  it.each([false, true])("rejects a second tab's stale save while preserving newer answers and 45 files (legacy=%s)", async legacy => {
    const original = savedDraft();
    if (legacy) records.set(database, original);
    const first = createDraftPersistence(invite), stale = createDraftPersistence(invite);
    await Promise.all([first.restore(), stale.restore()]);
    await first.save({ ...original, answers: { ...original.answers, additionalNotes: "Newest answer" } });
    const latest = records.get(database);
    await expect(stale.save(legacy ? original : freshDraft())).rejects.toMatchObject({ name: "DraftConflictError" });
    await expect(stale.save(freshDraft())).rejects.toMatchObject({ name: "DraftConflictError" });
    expect(records.get(database)).toBe(latest);
    expect(latest).toMatchObject({ answers: { additionalNotes: "Newest answer" }, files: original.files });
  });

  it("atomically rejects one of two simultaneous first saves instead of allowing last-writer loss", async () => {
    const original = savedDraft();
    const first = createDraftPersistence(invite), second = createDraftPersistence(invite);
    await Promise.all([first.restore(), second.restore()]);
    const results = await Promise.allSettled([first.save(original), second.save(freshDraft())]);
    expect(results.map(result => result.status)).toEqual(["fulfilled", "rejected"]);
    expect(records.get(database)).toMatchObject({ files: original.files, answers: original.answers });
  });

  it("aborts a save awaiting its read and rejects queued saves after disposal", async () => {
    const original = savedDraft(); records.set(database, original);
    const persistence = createDraftPersistence(invite); await persistence.restore(); holdWriteRead = true;
    const first = persistence.save({ ...original, answers: { ...original.answers, additionalNotes: "Old queued answer" } });
    const second = persistence.save(freshDraft());
    const results = Promise.allSettled([first, second]);
    await flush();
    persistence.dispose();
    completeWriteRead!();
    expect((await results).map(result => result.status)).toEqual(["rejected", "rejected"]);
    expect(records.get(database)).toBe(original);
    expect(writes).toEqual([]);
  });

  it("does not revive old queued writes when Strict Mode disposes and restores the same controller", async () => {
    const original = savedDraft(); records.set(database, original);
    const persistence = createDraftPersistence(invite); await persistence.restore();
    const stale = persistence.save(freshDraft()).catch(error => error);
    persistence.dispose();
    await persistence.restore();
    expect(await stale).toBeInstanceOf(Error);
    expect(records.get(database)).toBe(original);
    await persistence.save({ ...original, answers: { ...original.answers, additionalNotes: "Current generation" } });
    expect(records.get(database)).toMatchObject({ answers: { additionalNotes: "Current generation" }, files: original.files });
  });

  it("does not start a transaction when storage opens after the form was disposed", async () => {
    const original = savedDraft(); records.set(database, original);
    const persistence = createDraftPersistence(invite); await persistence.restore();
    const late: RequestHandlers = {};
    const transaction = vi.fn();
    openMock.mockImplementationOnce(() => late);
    const saving = persistence.save(freshDraft()).catch(error => error);
    await flush();
    persistence.dispose();
    late.result = { close: vi.fn(), transaction };
    late.onsuccess!();
    expect(await saving).toMatchObject({ name: "DraftDisposedError" });
    expect(transaction).not.toHaveBeenCalled();
    expect(records.get(database)).toBe(original);
  });

  it("rolls back an uncommitted put when the form is disposed", async () => {
    const original = savedDraft(); records.set(database, original);
    const persistence = createDraftPersistence(invite); await persistence.restore(); holdCommit = true;
    const saving = persistence.save(freshDraft()).catch(error => error);
    await flush();
    expect(writes).toHaveLength(1);
    persistence.dispose();
    completeCommit!();
    expect(await saving).toMatchObject({ name: "DraftDisposedError" });
    expect(records.get(database)).toBe(original);
  });

  it("advances revisions only after committed saves and serializes rapid edits without self-conflict", async () => {
    const original = savedDraft(); records.set(database, original);
    const persistence = createDraftPersistence(invite); await persistence.restore(); failedWrites = 1;
    await expect(persistence.save(freshDraft())).rejects.toThrow("temporarily unavailable");
    expect(records.get(database)).toBe(original);
    await Promise.all([persistence.save(original), persistence.save({ ...original, answers: { ...original.answers, additionalNotes: "Last rapid edit" } })]);
    expect(records.get(database)).toMatchObject({ answers: { additionalNotes: "Last rapid edit" }, files: original.files, _localRevision: expect.any(String) });
  });

});

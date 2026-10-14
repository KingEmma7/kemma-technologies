import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { submitBrief } from "../components/brief/submit";

const fetchMock = vi.fn<typeof fetch>();
type UploadEvent = { loaded: number };
class UploadRequest {
  static instances: UploadRequest[] = [];
  static automatic = true;
  static active = 0;
  static maximumActive = 0;
  method = "";
  url = "";
  headers = new Headers();
  body?: File;
  status = 0;
  responseText = "";
  aborted = false;
  pending = false;
  upload: { onprogress: ((event: UploadEvent) => void) | null; onload: (() => void) | null } = { onprogress: null, onload: null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  ontimeout: (() => void) | null = null;
  constructor() { UploadRequest.instances.push(this); }
  open(method: string, url: string) { this.method = method; this.url = url; }
  setRequestHeader(key: string, value: string) { this.headers.set(key, value); }
  send(body: File) {
    this.body = body;
    this.pending = true;
    UploadRequest.maximumActive = Math.max(UploadRequest.maximumActive, ++UploadRequest.active);
    if (UploadRequest.automatic) queueMicrotask(() => this.respond());
  }
  end() { if (this.pending) { this.pending = false; UploadRequest.active -= 1; } }
  progress(bytes: number) { this.upload.onprogress?.({ loaded: bytes }); }
  respond(payload: unknown = { ok: true }, status = 200) {
    if (!this.pending) return;
    this.end();
    this.status = status;
    this.responseText = JSON.stringify(payload);
    this.onload?.();
  }
  fail() { this.end(); this.onerror?.(); }
  abort() { this.aborted = true; this.end(); this.onabort?.(); }
}

beforeEach(() => {
  fetchMock.mockReset();
  UploadRequest.instances = [];
  UploadRequest.automatic = true;
  UploadRequest.active = UploadRequest.maximumActive = 0;
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("XMLHttpRequest", UploadRequest);
});
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

const uploadUrl = "https://storage.example.com/v1/upload";
const receipt = { ok: true, reference: "KEM-TEST", notification: "preview", preview: true };
function draft(count = 1, size = 1024) {
  return {
    schemaVersion: 2,
    answers: { businessName: "Example Crochet", email: "client@example.com" },
    products: [],
    files: Array.from({ length: count }, (_, index) => ({
      id: `file-${index}`, scope: "logo", role: "Additional file",
      file: new File([new Uint8Array(size).fill(index + 1)], `logo-${index}.png`, { type: "application/octet-stream" }),
    })),
  };
}
function session(original = draft(), { uploaded = [] as string[], mode = "r2", token = "signed-project-capability", uploadTokens = false } = {}) {
  return { sessionToken: token, uploadMode: mode, uploadUrl,
    files: original.files.map(entry => ({ id: entry.id, pathname: `briefs/project/files/${entry.id}/${entry.file.name}`, type: "image/png", uploaded: uploaded.includes(entry.id),
      ...(uploadTokens ? { uploadToken: `compact-token-${entry.id}` } : {}),
    })) };
}
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
const token = (expires: number) => `${Buffer.from(JSON.stringify({ exp: expires })).toString("base64url")}.signature`;
const flush = async () => { for (let index = 0; index < 20; index += 1) await Promise.resolve(); };

describe("direct private R2 uploads", () => {
  it("sends original bytes with a project capability and canonical MIME, then saves the answers", async () => {
    const original = draft(), messages: string[] = [];
    fetchMock.mockResolvedValueOnce(json(session(original))).mockResolvedValueOnce(json(receipt));
    expect(await submitBrief("project-invite", original, message => messages.push(message))).toEqual(receipt);
    const upload = UploadRequest.instances[0];
    expect(upload).toMatchObject({ method: "PUT", url: uploadUrl, body: original.files[0].file });
    expect(Object.fromEntries(upload.headers)).toEqual({
      authorization: "Bearer signed-project-capability", "content-type": "image/png", "x-brief-file-id": "file-0",
    });
    expect(new Uint8Array(await upload.body!.arrayBuffer())).toEqual(new Uint8Array(1024).fill(1));
    expect(fetchMock.mock.calls[1][0]).toBe("/api/brief/submit");
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toMatchObject({ answers: original.answers, schemaVersion: 2 });
    expect(messages).toContain("Uploading files: 1 of 1 saved · 1 KB of 1 KB transferred.");
  });

  it("uploads all 45 files with compact file capabilities and no more than two requests in flight", async () => {
    const original = draft(45), messages: string[] = [];
    fetchMock.mockResolvedValueOnce(json(session(original, { uploadTokens: true }))).mockResolvedValueOnce(json(receipt));
    await submitBrief("project-invite", original, message => messages.push(message));
    expect(UploadRequest.instances).toHaveLength(45);
    expect(UploadRequest.maximumActive).toBe(2);
    expect(new Set(UploadRequest.instances.map(upload => upload.headers.get("X-Brief-File-Id"))).size).toBe(45);
    expect(UploadRequest.instances.every(upload => upload.headers.get("Authorization") === `Bearer compact-token-${upload.headers.get("X-Brief-File-Id")}`)).toBe(true);
    expect(messages).toContain("Uploading files: 45 of 45 saved · 45 KB of 45 KB transferred.");
    expect(UploadRequest.instances.every((upload, index) => upload.body === original.files[index].file)).toBe(true);
    expect(fetchMock.mock.calls.at(-1)?.[0]).toBe("/api/brief/submit");
  });

  it("counts confirmed existing files and only transfers missing bytes on resume", async () => {
    const original = draft(2), messages: string[] = [];
    fetchMock.mockResolvedValueOnce(json(session(original, { uploaded: ["file-0"] }))).mockResolvedValueOnce(json(receipt));
    await submitBrief("same-project-invite", original, message => messages.push(message));
    expect(UploadRequest.instances).toHaveLength(1);
    expect(UploadRequest.instances[0].body).toBe(original.files[1].file);
    expect(messages).toContain("Uploading files: 1 of 2 saved · 1 KB of 2 KB transferred.");
  });

  it("lets a slow upload continue beyond two minutes while its bytes keep moving", async () => {
    vi.useFakeTimers(); UploadRequest.automatic = false;
    const original = draft(1, 4096), messages: string[] = [];
    fetchMock.mockResolvedValueOnce(json(session(original))).mockResolvedValueOnce(json(receipt));
    const sending = submitBrief("project-invite", original, message => messages.push(message));
    await flush();
    const upload = UploadRequest.instances[0];
    await vi.advanceTimersByTimeAsync(110_000); upload.progress(1024);
    await vi.advanceTimersByTimeAsync(110_000); upload.progress(2048);
    expect(upload.aborted).toBe(false);
    expect(messages).toContain("Uploading files: 0 of 1 saved · 2 KB of 4 KB transferred.");
    upload.respond();
    await expect(sending).resolves.toEqual(receipt);
  });

  it("rechecks storage after a transient interruption and retries only missing files", async () => {
    vi.useFakeTimers(); UploadRequest.automatic = false;
    const original = draft();
    fetchMock.mockResolvedValueOnce(json(session(original)))
      .mockResolvedValueOnce(json(session(original, { token: "renewed-capability" })))
      .mockResolvedValueOnce(json(receipt));
    const sending = submitBrief("project-invite", original, () => {});
    await flush(); UploadRequest.instances[0].fail();
    await vi.advanceTimersByTimeAsync(1000);
    expect(UploadRequest.instances).toHaveLength(2);
    expect(UploadRequest.instances[1].headers.get("Authorization")).toBe("Bearer renewed-capability");
    UploadRequest.instances[1].respond();
    await expect(sending).resolves.toEqual(receipt);
    const bodies = fetchMock.mock.calls.slice(0, 2).map(([, options]) => JSON.parse(String(options?.body)));
    expect(bodies[1]).toEqual(bodies[0]);
  });

  it("does not re-upload when the response was lost but storage confirms the file", async () => {
    vi.useFakeTimers(); UploadRequest.automatic = false;
    const original = draft();
    fetchMock.mockResolvedValueOnce(json(session(original)))
      .mockResolvedValueOnce(json(session(original, { uploaded: ["file-0"] })))
      .mockResolvedValueOnce(json(receipt));
    const sending = submitBrief("project-invite", original, () => {});
    await flush(); UploadRequest.instances[0].fail();
    await vi.advanceTimersByTimeAsync(1000);
    await expect(sending).resolves.toEqual(receipt);
    expect(UploadRequest.instances).toHaveLength(1);
  });

  it("stops an inactive transfer, limits retries and retains the original draft", async () => {
    vi.useFakeTimers(); UploadRequest.automatic = false;
    const original = draft();
    fetchMock.mockImplementation(async url => json(String(url).endsWith("session") ? session(original) : receipt));
    const result = submitBrief("project-invite", original, () => {}).catch(error => error);
    await flush();
    await vi.advanceTimersByTimeAsync(120_000 + 1000 + 120_000 + 2000 + 120_000);
    expect(await result).toMatchObject({ message: expect.stringContaining("Your draft and files stay on this device") });
    expect(UploadRequest.instances).toHaveLength(3);
    expect(UploadRequest.instances.every(upload => upload.aborted)).toBe(true);
    expect(fetchMock.mock.calls.every(([url]) => url === "/api/brief/session")).toBe(true);
    expect(original.files[0].file.size).toBe(1024);
  });

  it("does not retry permanent quota failures and cancels other pending transfers", async () => {
    UploadRequest.automatic = false;
    const original = draft(3), messages: string[] = [];
    fetchMock.mockResolvedValueOnce(json(session(original)));
    const result = submitBrief("project-invite", original, message => messages.push(message)).catch(error => error);
    await flush();
    const other = UploadRequest.instances[1];
    const lateProgress = other.upload.onprogress!;
    UploadRequest.instances[0].respond({ error: "This upload budget is full. Contact Kemma to share your files." }, 507);
    expect(await result).toMatchObject({ message: expect.stringContaining("This upload budget is full. Contact Kemma") });
    expect(other.aborted).toBe(true);
    const messageCount = messages.length;
    lateProgress({ loaded: 1024 });
    expect(messages).toHaveLength(messageCount);
    expect(UploadRequest.instances).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not finalize after an unconfirmed upload response", async () => {
    UploadRequest.automatic = false;
    fetchMock.mockResolvedValueOnce(json(session()));
    const result = submitBrief("project-invite", draft(), () => {}).catch(error => error);
    await flush(); UploadRequest.instances[0].respond({});
    expect(await result).toMatchObject({ message: expect.stringContaining("The upload has not been confirmed") });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refreshes expired upload authorization without changing file IDs", async () => {
    UploadRequest.automatic = false;
    fetchMock.mockResolvedValueOnce(json(session()))
      .mockResolvedValueOnce(json(session(draft(), { token: "fresh-capability" })))
      .mockResolvedValueOnce(json(receipt));
    const sending = submitBrief("project-invite", draft(), () => {});
    await flush(); UploadRequest.instances[0].respond({ error: "This project link has expired." }, 401);
    await flush();
    expect(UploadRequest.instances[1].headers.get("Authorization")).toBe("Bearer fresh-capability");
    UploadRequest.instances[1].respond();
    await expect(sending).resolves.toEqual(receipt);
  });

  it("renews a nearly expired session before saving answers after a long transfer", async () => {
    vi.useFakeTimers(); UploadRequest.automatic = false;
    const started = Date.now();
    const initial = token(started + 30 * 60_000), refreshed = token(started + 59 * 60_000);
    fetchMock.mockResolvedValueOnce(json(session(draft(), { token: initial })))
      .mockResolvedValueOnce(json(session(draft(), { token: refreshed, uploaded: ["file-0"] })))
      .mockResolvedValueOnce(json(receipt));
    const sending = submitBrief("project-invite", draft(), () => {});
    await flush();
    vi.setSystemTime(started + 29 * 60_000);
    UploadRequest.instances[0].respond();
    await expect(sending).resolves.toEqual(receipt);
    expect(JSON.parse(String(fetchMock.mock.calls.at(-1)?.[1]?.body)).sessionToken).toBe(refreshed);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(["/api/brief/session", "/api/brief/session", "/api/brief/submit"]);
  });

  it("retries a final expired session once with fresh authorization", async () => {
    const original = draft(0);
    fetchMock.mockResolvedValueOnce(json(session(original)))
      .mockResolvedValueOnce(json({ error: "Expired session." }, 401))
      .mockResolvedValueOnce(json(session(original, { token: "fresh-capability" })))
      .mockResolvedValueOnce(json(receipt));
    await expect(submitBrief("project-invite", original, () => {})).resolves.toEqual(receipt);
    expect(JSON.parse(String(fetchMock.mock.calls.at(-1)?.[1]?.body)).sessionToken).toBe("fresh-capability");
    expect(UploadRequest.instances).toHaveLength(0);
  });

  it("keeps local preview uploading through its own endpoint", async () => {
    fetchMock.mockResolvedValueOnce(json(session(draft(), { mode: "local" }))).mockResolvedValueOnce(json(receipt));
    await submitBrief("project-invite", draft(), () => {});
    expect(UploadRequest.instances[0]).toMatchObject({ url: "/api/brief/local-upload?file=file-0", method: "POST" });
    expect(UploadRequest.instances[0].headers.get("Content-Type")).toBe("application/octet-stream");
  });
});

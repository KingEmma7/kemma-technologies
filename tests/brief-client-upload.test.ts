import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { submitBrief } from "../components/brief/submit";

const fetchMock = vi.fn<typeof fetch>();
beforeEach(() => { fetchMock.mockReset(); vi.stubGlobal("fetch", fetchMock); });
afterEach(() => { vi.unstubAllGlobals(); });

const uploadUrl = "https://storage.example.com/v1/upload";
const receipt = { ok: true, reference: "KEM-TEST", notification: "preview", preview: true };
function draft() {
  return {
    schemaVersion: 2,
    answers: { businessName: "Example Crochet", email: "client@example.com" },
    products: [],
    files: [{ id: "original-file-id", scope: "logo", role: "Additional file", file: new File(["original logo bytes"], "logo.png", { type: "application/octet-stream" }) }],
  };
}
function session(uploaded = false, mode = "r2") {
  return { sessionToken: "signed-project-capability", uploadMode: mode, uploadUrl,
    files: [{ id: "original-file-id", pathname: "briefs/project/files/original-file-id/logo.png", type: "image/png", uploaded }] };
}
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });

describe("direct private R2 uploads", () => {
  it("sends original bytes with a project capability and canonical MIME, then saves the answers", async () => {
    const original = draft(), messages: string[] = [];
    fetchMock.mockResolvedValueOnce(json(session())).mockResolvedValueOnce(json({ ok: true })).mockResolvedValueOnce(json(receipt));
    expect(await submitBrief("project-invite", original, (message) => messages.push(message))).toEqual(receipt);
    const [url, options] = fetchMock.mock.calls[1];
    expect(url).toBe(uploadUrl);
    expect(options).toMatchObject({ method: "PUT", headers: {
      Authorization: "Bearer signed-project-capability", "X-Brief-File-Id": "original-file-id", "Content-Type": "image/png",
    } });
    expect(options?.body).toBe(original.files[0].file);
    expect(await original.files[0].file.text()).toBe("original logo bytes");
    expect(new Headers(options?.headers).has("Content-Length")).toBe(false);
    expect(fetchMock.mock.calls[2][0]).toBe("/api/brief/submit");
    expect(JSON.parse(String(fetchMock.mock.calls[2][1]?.body))).toMatchObject({ answers: original.answers, schemaVersion: 2 });
    expect(messages).toContain("Uploading file 1 of 1…");
  });

  it("resumes a retry without uploading already saved files", async () => {
    fetchMock.mockResolvedValueOnce(json(session(true))).mockResolvedValueOnce(json(receipt));
    await submitBrief("same-project-invite", draft(), () => {});
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(["/api/brief/session", "/api/brief/submit"]);
  });

  it("shows the Worker quota error, keeps original files and does not finalize the brief", async () => {
    const original = draft();
    fetchMock.mockResolvedValueOnce(json(session())).mockResolvedValueOnce(json({ error: "This upload budget is full. Contact Kemma to share your files." }, 507));
    await expect(submitBrief("project-invite", original, () => {})).rejects.toThrow("This upload budget is full. Contact Kemma");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(await original.files[0].file.text()).toBe("original logo bytes");
  });

  it("does not finalize after an unconfirmed upload response", async () => {
    fetchMock.mockResolvedValueOnce(json(session())).mockResolvedValueOnce(json({}));
    await expect(submitBrief("project-invite", draft(), () => {})).rejects.toThrow("The upload has not been confirmed");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retains a retryable error when the direct connection fails", async () => {
    fetchMock.mockResolvedValueOnce(json(session())).mockRejectedValueOnce(new Error("Connection interrupted"));
    await expect(submitBrief("project-invite", draft(), () => {})).rejects.toThrow("Your files stay on this device; please try again");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("keeps local preview uploading through its own endpoint", async () => {
    fetchMock.mockResolvedValueOnce(json(session(false, "local"))).mockResolvedValueOnce(json({ ok: true })).mockResolvedValueOnce(json(receipt));
    await submitBrief("project-invite", draft(), () => {});
    expect(fetchMock.mock.calls[1][0]).toBe("/api/brief/local-upload?file=original-file-id");
    expect(fetchMock.mock.calls[1][1]?.method).toBe("POST");
  });
});

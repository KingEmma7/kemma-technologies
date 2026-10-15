import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { signCapability, verifyCapability, type FileSpec } from "../lib/brief/config";
import { MAX_FILE_BYTES, MAX_FILES, MAX_TOTAL_BYTES } from "../lib/brief/schema";
import { acceptSubmission, allocationPath, beginSession, getSubmission, recordPath } from "../lib/brief/service";
import { fileStream, readDocument, writeBytes, writeDocument } from "../lib/brief/storage";
import { buildEmail, sendNotification } from "../lib/brief/email";
import { SITE } from "../lib/site";
import { GET as downloadOriginal } from "../app/api/brief/download/[id]/[file]/route";
import { POST as uploadOriginal } from "../app/api/brief/local-upload/route";
import { POST as uploadStatus } from "../app/api/brief/upload-status/route";
import { POST as submitBrief } from "../app/api/brief/submit/route";
import { GET as retryNotifications } from "../app/api/brief/retry-notifications/route";

const { sendEmail } = vi.hoisted(() => ({ sendEmail: vi.fn() }));
vi.mock("resend", () => ({ Resend: class { emails = { send: sendEmail }; } }));

let directory: string;
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "kemma-brief-tests-"));
  vi.stubEnv("BRIEF_LOCAL_DIR", directory);
  vi.stubEnv("BRIEF_SIGNING_SECRET", "test-only-signing-secret-with-at-least-32-bytes");
  vi.stubEnv("BRIEF_STORAGE_MODE", "local");
  vi.stubEnv("BRIEF_EMAIL_MODE", "preview");
  vi.stubEnv("BRIEF_TO_EMAIL", "");
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("VERCEL", "");
  sendEmail.mockReset();
});
afterEach(async () => { vi.unstubAllEnvs(); await rm(directory, { recursive: true, force: true }); });

const invite = (id = randomUUID()) => ({ id, token: signCapability({ kind: "invite", id, exp: Date.now() + 24 * 60 * 60 * 1000 }) });
const file = (size = 10) => ({ id: randomUUID(), name: "logo.txt", size, type: "text/plain", scope: "brand", role: "Additional file" as const });
const answers = () => ({ businessName: "Shalom Crotchets", email: "client@example.com", permission: true, socials: { instagram: "@shalom" }, policyTexts: { shipping: "Delivery in Accra." }, domain: "shalomcrotchets.com" });
const request = () => new Request("http://localhost:4190/api/brief/submit");

describe("cumulative invitation allowances", () => {
  it("issues compact per-file upload credentials for a 45-file manifest", async () => {
    const link=invite(), files=Array.from({length:45},(_,index)=>({...file(),name:`diagnostic-image-${index}-with-a-long-name.png`}));
    const session=await beginSession({invite:link.token,files});
    expect(session.sessionToken.length).toBeGreaterThan(16*1024);
    expect(verifyCapability(session.sessionToken,"session").files).toHaveLength(45);
    for(const specification of session.files){
      expect(specification.uploadToken.length).toBeLessThan(512);
      expect(verifyCapability(specification.uploadToken,"upload")).toEqual({kind:"upload",id:link.id,exp:verifyCapability(session.sessionToken,"session").exp,fileId:specification.id});
    }
    expect((await readDocument<{files:FileSpec[]}>(allocationPath(link.id)))?.value.files.every(specification=>!("uploadToken" in specification))).toBe(true);
  });

  it("counts orphan allocations across sessions instead of resetting the quota", async () => {
    const link = invite();
    const first = Array.from({ length: 30 }, () => file());
    const second = Array.from({ length: MAX_FILES - first.length + 1 }, () => file());
    await beginSession({ invite: link.token, files: first });
    await expect(beginSession({ invite: link.token, files: second })).rejects.toMatchObject({ status: 413 });
    const saved = await readDocument<{ files: FileSpec[] }>(allocationPath(link.id));
    expect(saved?.value.files).toHaveLength(first.length);
  });

  it("counts cumulative bytes even when no original has been uploaded yet", async () => {
    const link = invite();
    await beginSession({ invite: link.token, files: Array.from({ length: MAX_TOTAL_BYTES / MAX_FILE_BYTES }, () => file(MAX_FILE_BYTES)) });
    await expect(beginSession({ invite: link.token, files: [file(1)] })).rejects.toMatchObject({ status: 413 });
  });

  it("reuses exact file allocations on retry and rejects metadata changes to an existing ID", async () => {
    const link = invite(), original = file();
    const first = await beginSession({ invite: link.token, files: [original] });
    const retry = await beginSession({ invite: link.token, files: [original] });
    expect(first.files[0].pathname).toBe(retry.files[0].pathname);
    expect(retry.files[0].uploaded).toBe(false);
    expect((await readDocument<{ files: FileSpec[] }>(allocationPath(link.id)))?.value.files).toHaveLength(1);
    await expect(beginSession({ invite: link.token, files: [{ ...original, name: "changed.txt" }] })).rejects.toMatchObject({ status: 409 });
  });
});

describe("immutable submissions and original files", () => {
  it("binds compact upload authorization to one allocated project and file", async () => {
    const link=invite(), bytes=Buffer.from("exact-file"), session=await beginSession({invite:link.token,files:[file(bytes.length),file(bytes.length)]});
    const [first,second]=session.files;
    const upload=(authorization:string,fileId=first.id)=>uploadOriginal(new Request(`http://localhost:4190/api/brief/local-upload?file=${fileId}`,{method:"POST",headers:{Origin:"http://localhost:4190",Authorization:`Bearer ${authorization}`},body:Uint8Array.from(bytes).buffer}));
    expect((await upload(first.uploadToken,second.id)).status).toBe(403);
    expect((await upload(signCapability({kind:"upload",id:randomUUID(),fileId:first.id,exp:Date.now()+60_000}))).status).toBe(403);
    expect((await upload(signCapability({kind:"upload",id:link.id,fileId:first.id,exp:Date.now()-1}))).status).toBe(401);
    const [body,signature]=first.uploadToken.split(".");
    expect((await upload(`${body[0]==="a"?"b":"a"}${body.slice(1)}.${signature}`)).status).toBe(401);
    expect((await upload(link.token)).status).toBe(401);
    expect(await fileStream(first.pathname)).toBeNull();
    expect((await upload(first.uploadToken)).status).toBe(200);
    expect(Buffer.from(await new Response(await fileStream(first.pathname)).arrayBuffer())).toEqual(bytes);
    expect(await fileStream(second.pathname)).toBeNull();
  });

  it("accepts concurrent identical retries as one immutable submission and one preview email", async () => {
    const link = invite(), originalBytes = Buffer.from("crochet-original-file\u0000\u00ff", "utf8"), specification = file(originalBytes.byteLength);
    const session = await beginSession({ invite: link.token, files: [specification] });
    await writeBytes(session.files[0].pathname, originalBytes, "text/plain", null);
    const responses = await Promise.all([
      acceptSubmission(session.sessionToken, answers(), [], request()),
      acceptSubmission(session.sessionToken, answers(), [], request()),
    ]);
    expect(responses.every(value => value.ok && value.reference === responses[0].reference)).toBe(true);
    expect(responses.every(value => !("reviewToken" in value))).toBe(true);
    const record = await getSubmission(link.id);
    expect(record?.answers).toEqual(answers());
    expect(record?.files[0]).toMatchObject({ id: specification.id, scope: "brand", role: "Additional file" });
    expect(record?.baseUrl).toBe("http://localhost:4190");
    expect(verifyCapability(record!.reviewToken, "review").id).toBe(link.id);
    expect(await new Response(await fileStream(record!.files[0].pathname)).arrayBuffer()).toEqual(originalBytes.buffer.slice(originalBytes.byteOffset, originalBytes.byteOffset + originalBytes.byteLength));
    const preview = await readDocument<{ to: string[]; text: string; attachments: { content: string }[] }>(`briefs/${link.id}/email-preview.json`);
    expect(preview?.value.to).toEqual([SITE.email]);
    expect(preview?.value.text).toContain("shalomcrotchets.com");
    const attachment = JSON.parse(Buffer.from(preview!.value.attachments[0].content, "base64").toString());
    expect(attachment.answers).toEqual(answers());
    expect(attachment.files[0].downloadUrl).toContain(`/api/brief/download/${link.id}/${specification.id}`);
    expect((await readDocument<{ state: string }>(`briefs/${link.id}/notification.json`))?.value.state).toBe("preview");
    const savedEtag = (await readDocument(recordPath(link.id)))!.etag;
    await acceptSubmission(session.sessionToken, answers(), [], request());
    expect((await readDocument(recordPath(link.id)))!.etag).toBe(savedEtag);
  });

  it("refuses missing or partial originals before accepting answers", async () => {
    const link = invite(), specification = file(10);
    const session = await beginSession({ invite: link.token, files: [specification] });
    await expect(acceptSubmission(session.sessionToken, answers(), [], request())).rejects.toMatchObject({ status: 409 });
    await writeBytes(session.files[0].pathname, Buffer.from("short"), "text/plain", null);
    await expect(acceptSubmission(session.sessionToken, answers(), [], request())).rejects.toMatchObject({ status: 409 });
    expect(await getSubmission(link.id)).toBeNull();
  });

  it("rejects different answers on retry and new uploads after submission", async () => {
    const link = invite(), session = await beginSession({ invite: link.token, files: [] });
    await acceptSubmission(session.sessionToken, answers(), [], request());
    await expect(acceptSubmission(session.sessionToken, { ...answers(), domain: "different.com" }, [], request())).rejects.toMatchObject({ status: 409 });
    await expect(beginSession({ invite: link.token, files: [file()] })).rejects.toMatchObject({ status: 409 });
    expect((await getSubmission(link.id))?.answers.domain).toBe("shalomcrotchets.com");
  });

  it("rejects cross-project path substitution and local path traversal", async () => {
    const link = invite(), session = await beginSession({ invite: link.token, files: [file()] });
    const capability = verifyCapability(session.sessionToken, "session");
    const foreign = signCapability({ ...capability, files: capability.files.map(value => ({ ...value, pathname: `briefs/${randomUUID()}/files/${value.id}/logo.txt` })) });
    await expect(acceptSubmission(foreign, answers(), [], request())).rejects.toMatchObject({ status: 401 });
    await expect(writeBytes(`briefs/${link.id}/../../outside.txt`, Buffer.from("x"), "text/plain", null)).rejects.toThrow("Invalid storage path");
  });

  it("preserves product and private-download associations in the saved record", async () => {
    const link = invite(), productId = randomUUID(), bytes = Buffer.from("paid-pattern"), specification = { ...file(bytes.length), scope: `paid:${productId}`, role: "Private paid download" as const };
    const session = await beginSession({ invite: link.token, files: [specification] });
    await writeBytes(session.files[0].pathname, bytes, "text/plain", null);
    await acceptSubmission(session.sessionToken, answers(), [{ id: productId, name: "Bag pattern", price: "25" }], request());
    const record = await getSubmission(link.id);
    expect(record?.products[0]).toMatchObject({ id: productId, name: "Bag pattern" });
    expect(record?.files[0]).toMatchObject({ scope: `paid:${productId}`, role: "Private paid download" });
  });

  it("escapes user content in HTML and keeps identical notification payloads on retry", async () => {
    const link = invite(), session = await beginSession({ invite: link.token, files: [] });
    await acceptSubmission(session.sessionToken, { ...answers(), businessName: '<img src=x onerror="alert(1)">', description: "<script>unsafe</script>" }, [], request());
    const record = (await getSubmission(link.id))!;
    const first = buildEmail(record), retry = buildEmail(record);
    expect(first.html).not.toContain("<script>");
    expect(first.html).not.toContain("<img");
    expect(first.html).toContain("&lt;script&gt;");
    expect(first.text).toContain("<script>unsafe</script>");
    expect(first).toEqual(retry);
  });

  it("does not send an ambiguous notification again after the idempotency window", async () => {
    const link = invite(), session = await beginSession({ invite: link.token, files: [] });
    await acceptSubmission(session.sessionToken, answers(), [], request());
    const record = (await getSubmission(link.id))!, path = `briefs/${link.id}/notification.json`, prior = (await readDocument(path))!;
    await writeDocument(path, { state: "pending", attemptedAt: Date.now() - 24 * 60 * 60 * 1000, leaseUntil: 0 }, prior.etag);
    expect(await sendNotification(record)).toBe("pending");
    expect((await readDocument<{ state: string }>(path))?.value.state).toBe("pending");
  });

  it("streams originals only through the owner capability and forces private attachment headers", async () => {
    const link = invite(), bytes = Buffer.from("original bytes"), session = await beginSession({ invite: link.token, files: [file(bytes.length)] });
    await writeBytes(session.files[0].pathname, bytes, "text/plain", null);
    await acceptSubmission(session.sessionToken, answers(), [], request());
    const record = (await getSubmission(link.id))!;
    const context = { params: Promise.resolve({ id: link.id, file: session.files[0].id }) };
    const url = `http://localhost:4190/api/brief/download/${link.id}/${session.files[0].id}`;
    const response = await downloadOriginal(new Request(`${url}?key=${encodeURIComponent(record.reviewToken)}`), context);
    expect(response.status).toBe(200);
    expect(Buffer.from(await response.arrayBuffer())).toEqual(bytes);
    expect(response.headers.get("content-type")).toBe("application/octet-stream");
    expect(response.headers.get("content-disposition")).toContain("attachment;");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect((await downloadOriginal(new Request(`${url}?key=${encodeURIComponent(link.token)}`), context)).status).toBe(401);
    expect((await downloadOriginal(new Request(`${url}?key=${encodeURIComponent(signCapability({ kind: "review", id: randomUUID(), exp: Date.now() + 60_000 }))}`), context)).status).toBe(404);
    expect((await downloadOriginal(new Request(`${url}?key=${encodeURIComponent(record.reviewToken)}`), { params: Promise.resolve({ id: link.id, file: randomUUID() }) })).status).toBe(404);
  });

  it("rejects excess streamed upload bytes, accepts exact originals and does not overwrite them on retry", async () => {
    const link = invite(), bytes = Buffer.from("exact-file"), session = await beginSession({ invite: link.token, files: [file(bytes.length)] });
    const url = `http://localhost:4190/api/brief/local-upload?file=${session.files[0].id}`;
    const upload = (body: Buffer) => uploadOriginal(new Request(url, { method: "POST", headers: { Origin: "http://localhost:4190", Authorization: `Bearer ${session.sessionToken}` }, body: Uint8Array.from(body).buffer }));
    expect((await upload(Buffer.concat([bytes, Buffer.from("excess")]))).status).toBe(413);
    expect((await upload(bytes.subarray(0, 2))).status).toBe(409);
    expect((await upload(bytes)).status).toBe(200);
    expect((await upload(Buffer.from("other-file"))).status).toBe(200);
    expect(Buffer.from(await new Response(await fileStream(session.files[0].pathname)).arrayBuffer())).toEqual(bytes);
  });

  it("keeps POSTed answers and originals saved when the email provider rejects the notification", async () => {
    vi.stubEnv("BRIEF_EMAIL_MODE", "live");
    vi.stubEnv("RESEND_API_KEY", "test-only-not-a-service-credential");
    vi.stubEnv("CONTACT_FROM_EMAIL", "Kemma Test <test@example.com>");
    sendEmail.mockResolvedValue({ data: null, error: { name: "validation_error", statusCode: 422, message: "Test rejection" } });
    const link = invite(), bytes = Buffer.from("saved original"), session = await beginSession({ invite: link.token, files: [file(bytes.length)] });
    await writeBytes(session.files[0].pathname, bytes, "text/plain", null);
    const response = await submitBrief(new Request("http://localhost:4190/api/brief/submit", {
      method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:4190" },
      body: JSON.stringify({ sessionToken: session.sessionToken, schemaVersion: 2, answers: answers(), products: [] }),
    }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, notification: "pending" });
    expect((await getSubmission(link.id))?.answers).toEqual(answers());
    expect(Buffer.from(await new Response(await fileStream(session.files[0].pathname)).arrayBuffer())).toEqual(bytes);
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: [SITE.email] }), { idempotencyKey: `brief/${link.id}` });
    expect((await readDocument<{ uncertain: boolean }>(`briefs/${link.id}/notification.json`))?.value.uncertain).toBe(false);
  });

  it("can retry a confirmed rejection after the 24-hour idempotency window", async () => {
    vi.stubEnv("BRIEF_EMAIL_MODE", "live");
    vi.stubEnv("RESEND_API_KEY", "test-only-not-a-service-credential");
    vi.stubEnv("CONTACT_FROM_EMAIL", "Kemma Test <test@example.com>");
    sendEmail.mockResolvedValueOnce({ data: null, error: { name: "validation_error", statusCode: 422, message: "Test rejection" } });
    const link = invite(), session = await beginSession({ invite: link.token, files: [] });
    await acceptSubmission(session.sessionToken, answers(), [], request());
    const record = (await getSubmission(link.id))!, path = `briefs/${link.id}/notification.json`, prior = (await readDocument(path))!;
    await writeDocument(path, { state: "pending", attemptedAt: Date.now() - 24 * 60 * 60 * 1000, leaseUntil: 0, uncertain: false }, prior.etag);
    sendEmail.mockResolvedValueOnce({ data: { id: "test-email-id" }, error: null });
    expect(await sendNotification(record)).toBe("sent");
    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect((await readDocument<{ state: string; emailId: string }>(path))?.value).toMatchObject({ state: "sent", emailId: "test-email-id" });
  });

  it("retains a saved brief when recipient configuration is invalid and retries it after correction", async () => {
    vi.stubEnv("BRIEF_EMAIL_MODE", "live");
    vi.stubEnv("BRIEF_TO_EMAIL", "invalid-mailbox");
    vi.stubEnv("RESEND_API_KEY", "test-only-not-a-service-credential");
    vi.stubEnv("CONTACT_FROM_EMAIL", "Kemma Test <test@example.com>");
    const link = invite(), session = await beginSession({ invite: link.token, files: [] });
    const first = await acceptSubmission(session.sessionToken, answers(), [], request());
    expect(first).toMatchObject({ ok: true, notification: "pending" });
    expect(sendEmail).not.toHaveBeenCalled();
    const saved = (await readDocument(recordPath(link.id)))!;
    const path = `briefs/${link.id}/notification.json`;
    const pending = (await readDocument<{ state: string; leaseUntil: number; uncertain: boolean; attemptedAt: number }>(path))!;
    expect(pending.value).toMatchObject({ state: "pending", leaseUntil: 0, uncertain: false });
    expect(await readDocument(`briefs/${link.id}/email-payload.json`)).toBeNull();

    // Known-unsent preparation must not become an ambiguous delivery after 23h.
    await writeDocument(path, { ...pending.value, attemptedAt: Date.now() - 24 * 60 * 60 * 1000 }, pending.etag);
    vi.stubEnv("BRIEF_TO_EMAIL", "corrected-owner@example.com");
    sendEmail.mockResolvedValueOnce({ data: { id: "synthetic-email-id" }, error: null });
    const retry = await acceptSubmission(session.sessionToken, answers(), [], request());
    expect(retry).toMatchObject({ ok: true, reference: first.reference, notification: "sent" });
    expect((await readDocument(recordPath(link.id)))?.etag).toBe(saved.etag);
    expect(sendEmail).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ to: ["corrected-owner@example.com"] }),
      { idempotencyKey: `brief/${link.id}` },
    );
  });

  it("preserves ambiguous SDK network failures and avoids sending them again after the safe retry window", async () => {
    vi.stubEnv("BRIEF_EMAIL_MODE", "live");
    vi.stubEnv("RESEND_API_KEY", "test-only-not-a-service-credential");
    vi.stubEnv("CONTACT_FROM_EMAIL", "Kemma Test <test@example.com>");
    sendEmail.mockResolvedValue({ data: null, error: { name: "application_error", statusCode: null, message: "Unable to fetch data." } });
    const link = invite(), session = await beginSession({ invite: link.token, files: [] });
    await acceptSubmission(session.sessionToken, answers(), [], request());
    const record = (await getSubmission(link.id))!, path = `briefs/${link.id}/notification.json`, prior = (await readDocument<{ uncertain?: boolean }>(path))!;
    expect(prior.value.uncertain).toBe(true);
    await writeDocument(path, { ...prior.value, attemptedAt: Date.now() - 24 * 60 * 60 * 1000, leaseUntil: 0 }, prior.etag);
    expect(await sendNotification(record)).toBe("pending");
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("authenticates the retry cron before accessing records and retries a known failure", async () => {
    vi.stubEnv("CRON_SECRET", "test-cron-secret-with-at-least-32-characters");
    const url = "http://localhost:4190/api/brief/retry-notifications";
    expect((await retryNotifications(new Request(url))).status).toBe(401);
    expect((await retryNotifications(new Request(url, { headers: { Authorization: "Bearer wrong" } }))).status).toBe(401);
    vi.stubEnv("BRIEF_EMAIL_MODE", "live");
    vi.stubEnv("RESEND_API_KEY", "test-only-not-a-service-credential");
    vi.stubEnv("CONTACT_FROM_EMAIL", "Kemma Test <test@example.com>");
    sendEmail.mockResolvedValueOnce({ data: null, error: { name: "validation_error", statusCode: 422, message: "Test rejection" } });
    const link = invite(), session = await beginSession({ invite: link.token, files: [] });
    await acceptSubmission(session.sessionToken, answers(), [], request());
    sendEmail.mockResolvedValueOnce({ data: { id: "test-email-id" }, error: null });
    const response = await retryNotifications(new Request(url, { headers: { Authorization: "Bearer test-cron-secret-with-at-least-32-characters" } }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ retried: 1, sent: 1, pending: 0, needsReview: 0 });
  });
});


describe("answers checkpoint before original uploads", () => {
  it("saves answers and file identities without accepting an incomplete submission", async () => {
    const link=invite(), files=[file()], checkpoint={answers:answers(),products:[]};
    const session=await beginSession({invite:link.token,files,checkpoint});
    expect(session.answersBackedUp).toBe(true);
    const path=`briefs/${link.id}/answers-checkpoint.json`;
    expect((await readDocument(path))?.value).toMatchObject({...checkpoint,files:session.files.map(spec=>({id:spec.id,name:spec.name,type:spec.type,size:spec.size,scope:spec.scope,role:spec.role,pathname:spec.pathname}))});
    expect(await getSubmission(link.id)).toBeNull();
    expect(await readDocument(`briefs/${link.id}/notification.json`)).toBeNull();
    await expect(acceptSubmission(session.sessionToken,checkpoint.answers,[],request())).rejects.toMatchObject({status:409});
    // Another tab cannot replace the recovery snapshot with stale or empty answers.
    await beginSession({invite:link.token,files,checkpoint:{answers:{...answers(),businessName:"Older tab"},products:[]}});
    expect((await readDocument<{answers:{businessName:string}}>(path))?.value.answers.businessName).toBe(checkpoint.answers.businessName);
  });
  it("rejects invalid checkpoint answers before allocating or saving data",async()=>{
    const link=invite();
    await expect(beginSession({invite:link.token,files:[],checkpoint:{answers:{},products:[]}})).rejects.toThrow("business name");
    expect(await readDocument(allocationPath(link.id))).toBeNull();
    expect(await readDocument(`briefs/${link.id}/answers-checkpoint.json`)).toBeNull();
  });
});


describe("private bounded upload diagnostics",()=>{
  const status=(token:string,stage:string,extra={})=>uploadStatus(new Request("http://localhost:4190/api/brief/upload-status",{method:"POST",headers:{Origin:"http://localhost:4190","Content-Type":"application/json"},body:JSON.stringify({token,stage,...extra})}));
  it("records stages for only the signed file and never accepts arbitrary diagnostic text",async()=>{
    const link=invite(),session=await beginSession({invite:link.token,files:[file()]});
    expect((await status(session.files[0].uploadToken,"reading")).status).toBe(200);
    expect((await status(session.files[0].uploadToken,"read_failed",{code:"NotReadableError"})).status).toBe(200);
    const path=`briefs/${link.id}/upload-status.json`, record=await readDocument(path);
    expect(record?.value).toMatchObject({files:{[session.files[0].id]:{reading:{at:expect.any(String)},read_failed:{code:"NotReadableError"}}}});
    expect((await status(session.files[0].uploadToken,"read_failed",{code:"private filename.png"})).status).toBe(400);
    expect((await status(link.token,"reading")).status).toBe(401);
    expect((await status(session.sessionToken,"reading")).status).toBe(401);
    expect((await status(signCapability({kind:"upload",id:link.id,fileId:randomUUID(),exp:Date.now()+60000}),"reading")).status).toBe(403);
    expect((await readDocument(path))?.value).toEqual(record?.value);
  });
});

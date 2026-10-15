type BriefFile = {
  id: string;
  scope: string;
  role: string;
  file: File;
  needsOriginal?: boolean;
};

type BriefDraft = {
  schemaVersion: number;
  answers: Record<string, unknown>;
  products: unknown[];
  files: BriefFile[];
};

type BriefSession = {
  submissionId: string;
  sessionToken: string;
  uploadMode: "local" | "r2";
  uploadUrl?: string;
  preview: boolean;
  files: { id: string; pathname: string; type: string; uploaded: boolean; uploadToken?: string }[];
};

export type BriefReceipt = {
  ok: true;
  reference: string;
  notification: "sent" | "pending" | "preview";
  preview: boolean;
};

export class BriefUploadError extends Error {
  constructor(message: string, readonly fileId: string) { super(message); this.name = "BriefUploadError"; }
}

const IDLE_TIMEOUT = 120_000;
const FILE_READ_TIMEOUT = 60_000;
const FILE_READ_CHUNK_BYTES = 8 * 1024 * 1024;
const MAX_RETRIES = 2;
const SESSION_RENEWAL_MARGIN = 120_000;

class TransferError extends Error {
  constructor(message: string, readonly status = 0, readonly retryable = false) {
    super(message);
  }
}
class FileReadError extends TransferError {
  constructor(message: string, readonly readCode = "UnknownError") { super(message); }
}

function uploadStatus(token: string | undefined, stage: string, error?: unknown) {
  if (!token || typeof window === "undefined") return;
  const allowed = ["NotReadableError", "NotFoundError", "SecurityError", "AbortError", "TimeoutError", "InvalidStateError", "SizeMismatch"];
  const name = error instanceof FileReadError ? error.readCode : error instanceof Error ? error.name : "";
  const code = error ? allowed.includes(name) ? name : error instanceof TransferError ? error.status ? "http" : "network" : "UnknownError" : undefined;
  // Diagnostic delivery cannot hold up or fail the client's send.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    void fetch("/api/brief/upload-status", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, stage, ...(code ? { code } : {}) }), signal: controller.signal, keepalive: true })
      .catch(() => {}).finally(() => clearTimeout(timer));
  } catch { clearTimeout(timer); }
}

const transientStatus = (status: number) => [408, 425, 429, 500, 502, 503, 504].includes(status);
const stopped = () => new DOMException("Sending was stopped.", "AbortError");
function ensureActive(signal: AbortSignal) { if (signal.aborted) throw stopped(); }

function wait(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    ensureActive(signal);
    const cancel = () => { clearTimeout(timer); reject(stopped()); };
    const timer = setTimeout(() => { signal.removeEventListener("abort", cancel); resolve(); }, milliseconds);
    signal.addEventListener("abort", cancel, { once: true });
  });
}

async function request<T>(url: string, body: unknown, signal: AbortSignal): Promise<T> {
  ensureActive(signal);
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal.addEventListener("abort", cancel, { once: true });
  const timer = setTimeout(cancel, IDLE_TIMEOUT);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    ensureActive(signal);
    if (controller.signal.aborted) throw new TransferError("Kemma stopped responding. Please check your connection.", 0, true);
    if (!response.ok) {
      throw new TransferError(
        typeof payload?.error === "string" ? payload.error
          : typeof payload?.message === "string" ? payload.message
            : "Couldn’t save your brief. Please try again.",
        response.status, transientStatus(response.status),
      );
    }
    return payload as T;
  } catch (error) {
    ensureActive(signal);
    if (error instanceof TransferError) throw error;
    throw new TransferError("Couldn’t reach Kemma. Please check your connection.", 0, true);
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", cancel);
  }
}

function reportReadFailure(stage: "create" | "start" | "read" | "result" | "prepare" | "fallback", error: unknown) {
  const names = ["AbortError", "EncodingError", "InvalidStateError", "NotFoundError", "NotReadableError", "NotSupportedError", "SecurityError", "TypeError", "ReferenceError", "UnknownError", "TimeoutError", "SizeMismatch", "OriginalFileAttempt"];
  const candidate = error && typeof error === "object" && "name" in error ? error.name : undefined;
  const name = typeof candidate === "string" && names.includes(candidate) ? candidate : "UnknownError";
  // Do not log the exception object/message, original file name, contents, or capability.
  console.warn("[brief] File read failed.", { stage, name });
  return name;
}

/** Materialize only active uploads with FileReader, including older Safari-restored Files. */
function uploadBody(file: File, type: string, signal: AbortSignal): Promise<Blob> {
  return new Promise((resolve, reject) => {
    ensureActive(signal);
    if (file.size <= 0) {
      reject(new TransferError("Choose a non-empty original file."));
      return;
    }
    // Blob-backed originals stream through XHR without a whole-file ArrayBuffer.
    if (file.size > FILE_READ_CHUNK_BYTES) { resolve(file.slice(0, file.size, type)); return; }
    let reader: FileReader;
    try { reader = new FileReader(); }
    catch (error) {
      reportReadFailure("create", error);
      reject(new FileReadError("This browser couldn’t open the original file. Keep this page open and try again."));
      return;
    }
    let settled = false;
    const finish = (error?: Error, body?: Blob) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener("abort", cancel);
      reader.onload = reader.onerror = reader.onabort = null;
      if (error) reject(error); else resolve(body!);
    };
    const abortRead = () => { if (reader.readyState === FileReader.LOADING) reader.abort(); };
    const cancel = () => { finish(stopped()); abortRead(); };
    const timer = setTimeout(() => {
      reportReadFailure("read", new DOMException("", "TimeoutError"));
      finish(new FileReadError("Reading the original file took too long. Keep this page open and try again.", "TimeoutError"));
      abortRead();
    }, FILE_READ_TIMEOUT);
    signal.addEventListener("abort", cancel, { once: true });
    reader.onload = () => {
      if (settled || signal.aborted) return;
      const buffer = reader.result;
      if (!(buffer instanceof ArrayBuffer) || buffer.byteLength !== file.size) {
        reportReadFailure("result", new DOMException("", "SizeMismatch"));
        finish(new FileReadError("This browser couldn’t read the complete original file. Keep this page open and try again.", "SizeMismatch"));
        return;
      }
      try { finish(undefined, new Blob([buffer], { type })); }
      catch (error) {
        reportReadFailure("prepare", error);
        finish(new FileReadError("This browser couldn’t prepare the original file. Keep this page open and try again."));
      }
    };
    reader.onerror = () => {
      const code = reportReadFailure("read", reader.error);
      finish(new FileReadError("This browser couldn’t read the original file. Keep this page open and try again.", code));
    };
    reader.onabort = () => finish(new FileReadError("Reading the original file was interrupted. Keep this page open and try again.", "AbortError"));
    try { reader.readAsArrayBuffer(file); }
    catch (error) {
      reportReadFailure("start", error);
      finish(new FileReadError("This browser couldn’t read the original file. Keep this page open and try again."));
      abortRead();
    }
  });
}

/** Browser events report actual bytes; a slow but moving upload stays alive. */
async function uploadFile(
  session: BriefSession,
  entry: BriefFile,
  specification: BriefSession["files"][number],
  signal: AbortSignal,
  progress: (loaded: number) => void,
  allowOriginalFile: () => boolean,
): Promise<void> {
  const local = session.uploadMode === "local";
  if (!local && (session.uploadMode !== "r2" || !session.uploadUrl)) throw new TransferError("The upload link is unavailable. Please try again.");
  // Only the two active uploads are materialized; never buffer the entire collection.
  let body: Blob;
  uploadStatus(specification.uploadToken, "reading");
  try { body = await uploadBody(entry.file, local ? "application/octet-stream" : specification.type, signal); }
  catch (error) {
    ensureActive(signal);
    if (!(error instanceof FileReadError) || !allowOriginalFile()) throw error;
    uploadStatus(specification.uploadToken, "read_failed", error);
    // Some restored Safari Files upload correctly even when local readers reject them.
    // Permit one original-body attempt; the server verifies the complete expected size before acknowledgement.
    reportReadFailure("fallback", new DOMException("", "OriginalFileAttempt"));
    body = entry.file;
  }
  uploadStatus(specification.uploadToken, "uploading");
  return new Promise((resolve, reject) => {
    ensureActive(signal);
    const xhr = new XMLHttpRequest();
    let settled = false;
    let loaded = 0;
    let timer: ReturnType<typeof setTimeout>;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener("abort", cancel);
      xhr.onload = xhr.onerror = xhr.onabort = xhr.ontimeout = null;
      xhr.upload.onprogress = xhr.upload.onload = null;
      if (error) { uploadStatus(specification.uploadToken, "upload_failed", error); reject(error); }
      else { uploadStatus(specification.uploadToken, "saved"); resolve(); }
    };
    const cancel = () => { finish(stopped()); xhr.abort(); };
    const keepAlive = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        finish(new TransferError("The upload stopped responding. Please check your connection.", 0, true));
        xhr.abort();
      }, IDLE_TIMEOUT);
    };
    const report = (bytes: number) => {
      if (settled || signal.aborted || !Number.isFinite(bytes)) return;
      const next = Math.min(entry.file.size, Math.max(loaded, bytes));
      if (next > loaded) { loaded = next; keepAlive(); progress(loaded); }
    };
    // Register before open/send for browsers that otherwise miss upload events.
    xhr.upload.onprogress = event => report(event.loaded);
    xhr.upload.onload = () => report(entry.file.size);
    xhr.onload = () => {
      if (settled) return;
      let payload: { ok?: unknown; error?: unknown } | null = null;
      try { payload = JSON.parse(xhr.responseText); } catch { /* An acknowledgement is required. */ }
      if (xhr.status < 200 || xhr.status >= 300) {
        finish(new TransferError(typeof payload?.error === "string" ? payload.error : "Upload was not saved.", xhr.status, transientStatus(xhr.status)));
      } else if (payload?.ok !== true) {
        finish(new TransferError("The upload has not been confirmed. Please try again."));
      } else { report(entry.file.size); finish(); }
    };
    xhr.onerror = () => finish(new TransferError("The connection was interrupted.", 0, true));
    xhr.ontimeout = () => finish(new TransferError("The upload stopped responding.", 0, true));
    xhr.onabort = () => finish(stopped());
    signal.addEventListener("abort", cancel, { once: true });
    try {
      xhr.open(local ? "POST" : "PUT", local ? `/api/brief/local-upload?file=${encodeURIComponent(entry.id)}` : session.uploadUrl!);
      xhr.setRequestHeader("Authorization", `Bearer ${specification.uploadToken || session.sessionToken}`);
      xhr.setRequestHeader("Content-Type", local ? "application/octet-stream" : specification.type);
      if (!local) xhr.setRequestHeader("X-Brief-File-Id", entry.id);
      keepAlive();
      xhr.send(body);
    } catch (error) {
      finish(error instanceof Error ? error : new TransferError("The upload could not start."));
    }
  });
}

function expiry(token: string) {
  // Advisory only. The server verifies the signed capability on every request.
  try {
    const body = token.split(".")[0].replace(/-/g, "+").replace(/_/g, "/");
    const value = JSON.parse(atob(body));
    if (typeof value.exp === "number" && Number.isFinite(value.exp)) return value.exp;
  } catch { /* Older preview responses remain usable without decoding. */ }
  return Date.now() + 30 * 60_000;
}

const formatBytes = (bytes: number) => bytes >= 1_048_576
  ? `${(bytes / 1_048_576).toFixed(1)} MB`
  : `${Math.ceil(bytes / 1024)} KB`;

/** Stable file IDs let interrupted sends resume the same private inventory. */
export async function submitBrief(
  invite: string,
  draft: BriefDraft,
  progress: (message: string) => void,
): Promise<BriefReceipt> {
  const controller = new AbortController();
  const { signal } = controller;
  const report = (message: string) => { if (!signal.aborted) progress(message); };
  const uploaded = new Set<string>();
  const bytes = new Map<string, number>();
  const totalBytes = draft.files.reduce((sum, entry) => sum + entry.file.size, 0);
  let session: BriefSession | undefined;
  let renewAt = 0;
  let refreshing: Promise<BriefSession> | null = null;
  const reportUploads = () => {
    const transferred = [...bytes.values()].reduce((sum, value) => sum + value, 0);
    report(`Uploading files: ${uploaded.size} of ${draft.files.length} saved · ${formatBytes(transferred)} of ${formatBytes(totalBytes)} transferred.`);
  };
  const markSaved = (entry: BriefFile) => { uploaded.add(entry.id); bytes.set(entry.id, entry.file.size); };
  const getSession = (force = false): Promise<BriefSession> => {
    ensureActive(signal);
    if (refreshing) return refreshing;
    if (!force && session && Date.now() < renewAt) return Promise.resolve(session);
    refreshing = (async () => {
      let response: BriefSession | undefined;
      for (let retry = 0; ; retry += 1) {
        try {
          response = await request<BriefSession>("/api/brief/session", {
            invite,
            checkpoint: { answers: draft.answers, products: draft.products },
            files: draft.files.map(({ id, scope, role, file }) => ({
              id, scope, role, name: file.name,
              type: file.type || "application/octet-stream", size: file.size,
            })),
          }, signal);
          break;
        } catch (error) {
          if (!(error instanceof TransferError) || !error.retryable || retry >= MAX_RETRIES) throw error;
          report("Reconnecting to Kemma… Your draft is still saved here.");
          await wait(1000 * 2 ** retry, signal);
        }
      }
      if (!response?.sessionToken || !Array.isArray(response.files) || draft.files.some(entry => !response.files.some(file => file.id === entry.id))) {
        throw new TransferError("Couldn’t prepare your brief. Please try again.");
      }
      session = response;
      renewAt = Math.max(Date.now() + 1000, expiry(response.sessionToken) - SESSION_RENEWAL_MARGIN);
      for (const entry of draft.files) if (response.files.find(file => file.id === entry.id)?.uploaded) markSaved(entry);
      return response;
    })().finally(() => { refreshing = null; });
    return refreshing;
  };
  const sendFile = async (entry: BriefFile) => {
    let retry = 0;
    let renewed = false;
    let checkedDuplicate = false;
    let originalFileAttempted = false;
    try {
      for (;;) {
        const current = await getSession();
        if (uploaded.has(entry.id)) return;
        if (entry.needsOriginal) throw new FileReadError("This original is no longer available on this device. Choose the original file again.", "NotReadableError");
        const specification = current.files.find(file => file.id === entry.id)!;
        bytes.set(entry.id, 0);
        reportUploads();
        try {
          await uploadFile(current, entry, specification, signal, loaded => { bytes.set(entry.id, loaded); reportUploads(); }, () => {
            if (originalFileAttempted) return false;
            originalFileAttempted = true;
            return true;
          });
          markSaved(entry);
          reportUploads();
          return;
        } catch (error) {
          ensureActive(signal);
          // A lost response can still save bytes. Confirm with the server before retrying.
          if (error instanceof TransferError && (error.status === 401 && !renewed || error.status === 412 && !checkedDuplicate)) {
            if (error.status === 401) renewed = true; else checkedDuplicate = true;
            await getSession(true);
            if (uploaded.has(entry.id)) { reportUploads(); return; }
            if (error.status === 401) continue;
          }
          if (!(error instanceof TransferError) || !error.retryable || retry >= MAX_RETRIES) throw error;
          bytes.set(entry.id, 0);
          report("Connection interrupted. Retrying your upload…");
          await wait(1000 * 2 ** retry++, signal);
          await getSession(true);
        }
      }
    } catch (error) {
      if (signal.aborted) throw error;
      const reason = error instanceof Error ? ` ${error.message}` : "";
      throw new BriefUploadError(`Couldn’t upload ${entry.file.name}.${reason} Your draft and files stay on this device. Please try again.`, entry.id);
    }
  };
  let tasks: Promise<void>[] = [];
  try {
    report("Preparing your brief…");
    await getSession();
    let next = 0;
    const sendNext = async () => {
      while (next < draft.files.length) {
        ensureActive(signal);
        await sendFile(draft.files[next++]);
      }
    };
    tasks = Array.from({ length: Math.min(2, draft.files.length) }, sendNext);
    await Promise.all(tasks);
    report("Saving your answers…");
    let receipt: BriefReceipt;
    let renewed = false;
    for (let retry = 0; ; ) {
      const current = await getSession();
      try {
        receipt = await request<BriefReceipt>("/api/brief/submit", {
          sessionToken: current.sessionToken, schemaVersion: 2,
          answers: draft.answers, products: draft.products,
        }, signal);
        break;
      } catch (error) {
        if (error instanceof TransferError && error.status === 401 && !renewed) { renewed = true; await getSession(true); continue; }
        if (!(error instanceof TransferError) || !error.retryable || retry >= MAX_RETRIES) throw error;
        report("Confirming your brief with Kemma… Your draft is still saved here.");
        await wait(1000 * 2 ** retry++, signal);
      }
    }
    if (receipt?.ok !== true || !receipt.reference) throw new Error("Kemma hasn’t confirmed the save yet. Your draft stays here. Please try again.");
    return receipt;
  } catch (error) {
    controller.abort();
    await Promise.allSettled(tasks);
    if (error instanceof BriefUploadError) throw error;
    const message = error instanceof Error ? error.message : "Couldn’t send your brief.";
    throw new Error(message.includes("draft") ? message : `${message} Your draft stays here. Please try again.`);
  } finally {
    controller.abort();
  }
}

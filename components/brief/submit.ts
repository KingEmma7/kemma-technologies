type BriefFile = {
  id: string;
  scope: string;
  role: string;
  file: File;
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
  files: { id: string; pathname: string; type: string; uploaded: boolean }[];
};

export type BriefReceipt = {
  ok: true;
  reference: string;
  notification: "sent" | "pending" | "preview";
  preview: boolean;
};

async function request<T>(url: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120_000),
    });
  } catch {
    throw new Error("Couldn’t reach Kemma. Your draft stays here. Please try again.");
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      typeof payload?.error === "string" ? payload.error
        : typeof payload?.message === "string" ? payload.message
          : "Couldn’t save your brief. Your draft stays here. Please try again.",
    );
  }
  return payload as T;
}

/** Session and file IDs make retries resume the same brief and upload inventory. */
export async function submitBrief(
  invite: string,
  draft: BriefDraft,
  progress: (message: string) => void,
): Promise<BriefReceipt> {
  progress("Preparing your brief…");
  const session = await request<BriefSession>("/api/brief/session", {
    invite,
    files: draft.files.map(({ id, scope, role, file }) => ({
      id, scope, role,
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
    })),
  });
  if (!session?.sessionToken || !Array.isArray(session.files)) {
    throw new Error("Couldn’t prepare your brief. Your draft stays here. Please try again.");
  }
  for (let index = 0; index < draft.files.length; index += 1) {
    const { id, file } = draft.files[index];
    const specification = session.files.find((item) => item.id === id);
    if (!specification) throw new Error("An upload could not be prepared. Please try again.");
    if (specification.uploaded) continue;
    progress(`Uploading file ${index + 1} of ${draft.files.length}…`);
    try {
      let response: Response;
      if (session.uploadMode === "local") {
        response = await fetch(`/api/brief/local-upload?file=${encodeURIComponent(id)}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.sessionToken}`,
            "Content-Type": "application/octet-stream",
          },
          body: file,
          signal: AbortSignal.timeout(120_000),
        });
      } else if (session.uploadMode === "r2") {
        if (!session.uploadUrl) throw new Error("The upload link is unavailable. Please try again.");
        response = await fetch(session.uploadUrl, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.sessionToken}`,
            "X-Brief-File-Id": id,
            "Content-Type": specification.type,
          },
          body: file,
          signal: AbortSignal.timeout(120_000),
        });
      } else {
        throw new Error("Uploads are not available yet.");
      }
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(typeof payload?.error === "string" ? payload.error : "Upload was not saved.");
      }
      if (payload?.ok !== true) throw new Error("The upload has not been confirmed. Please try again.");
    } catch (error) {
      const reason = error instanceof Error ? ` ${error.message}` : "";
      throw new Error(`Couldn’t upload ${file.name}.${reason} Your files stay on this device; please try again.`);
    }
  }
  progress("Saving your answers…");
  const receipt = await request<BriefReceipt>("/api/brief/submit", {
    sessionToken: session.sessionToken,
    schemaVersion: 2,
    answers: draft.answers,
    products: draft.products,
  });
  if (receipt?.ok !== true || !receipt.reference) {
    throw new Error("Kemma hasn’t confirmed the save yet. Your draft stays here. Please try again.");
  }
  return receipt;
}

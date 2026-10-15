import { z } from "zod";
import { BriefError, verifyCapability } from "@/lib/brief/config";
import { assertSameOrigin, readJson } from "@/lib/brief/schema";
import { briefFailure, briefResponse } from "@/lib/brief/http";
import { allocationPath } from "@/lib/brief/service";
import { Conflict, readDocument, writeDocument } from "@/lib/brief/storage";

export const runtime = "nodejs";
export const maxDuration = 30;
const schema = z.object({
  token: z.string().max(1024),
  stage: z.enum(["reading", "uploading", "saved", "read_failed", "upload_failed"]),
  code: z.enum(["NotReadableError", "NotFoundError", "SecurityError", "AbortError", "TimeoutError", "InvalidStateError", "SizeMismatch", "UnknownError", "network", "http"]).optional(),
}).strict();
type Status = { files: Record<string, Record<string, { at: string; code?: string }>> };

/** Fixed, private stage names only: no answers, filenames, file contents or raw exceptions. */
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const parsed = schema.safeParse(await readJson(request, 2048));
    if (!parsed.success) throw new BriefError("Invalid upload status.");
    const capability = verifyCapability(parsed.data.token, "upload");
    const allocation = await readDocument<{ files: { id: string }[] }>(allocationPath(capability.id));
    if (!allocation?.value.files.some(file => file.id === capability.fileId)) throw new BriefError("Invalid upload status.", 403);
    const path = `briefs/${capability.id}/upload-status.json`;
    for (let attempt = 0; attempt < 3; attempt++) {
      const old = await readDocument<Status>(path);
      const files = { ...old?.value.files };
      files[capability.fileId] = { ...files[capability.fileId], [parsed.data.stage]: {
        at: new Date().toISOString(), ...(parsed.data.code ? { code: parsed.data.code } : {}),
      } };
      try { await writeDocument(path, { files }, old?.etag ?? null); return briefResponse({ ok: true }); }
      catch (error) { if (!(error instanceof Conflict)) throw error; }
    }
    throw new BriefError("Status update is busy.", 409);
  } catch (error) { return briefFailure(error); }
}

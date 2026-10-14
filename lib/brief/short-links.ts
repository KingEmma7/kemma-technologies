import { createHash } from "node:crypto";
import { z } from "zod";
import { signCapability } from "./config";

const linksSchema = z.record(
  z.string().regex(/^[a-f0-9]{64}$/),
  z.object({ id: z.uuid(), exp: z.number().int().positive().safe() }).strict(),
);

// The short code is a private bearer link. Keep only its hash in server config.
export function inviteForShortCode(code: string): string | null {
  if (!/^[A-Za-z0-9_-]{22}$/.test(code)) return null;
  const configured = process.env.BRIEF_SHORT_LINKS;
  if (!configured || configured.length > 32_000) return null;
  try {
    const links = linksSchema.parse(JSON.parse(configured));
    const hash = createHash("sha256").update(code).digest("hex");
    if (!Object.hasOwn(links, hash)) return null;
    const invite = links[hash];
    if (invite.exp <= Date.now()) return null;
    // Identical payload and signature preserve existing drafts and submissions.
    return signCapability({ kind: "invite", id: invite.id, exp: invite.exp });
  } catch {
    return null;
  }
}

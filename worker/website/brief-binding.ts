import { env } from "cloudflare:workers";
import type { BriefWorker } from "../../lib/brief/worker-binding";

export function getBriefWorker(): BriefWorker {
  const binding = (env as { BRIEF_INTERNAL?: BriefWorker }).BRIEF_INTERNAL;
  if (!binding) throw new Error("The private brief Worker binding is missing.");
  return binding;
}

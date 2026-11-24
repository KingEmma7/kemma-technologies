export interface BriefWorker {
  sign(body: string): Promise<string>;
  verify(body: string, signature: string): Promise<boolean>;
  fetch(request: Request): Promise<Response>;
}

export function getBriefWorker(): BriefWorker | null {
  return null;
}

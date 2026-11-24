import vinextHandler from "vinext/server/fetch-handler";

type FetchHandler = (request: Request, env: unknown, ctx: unknown) => Response | Promise<Response>;

const fetchHandler: FetchHandler =
  typeof vinextHandler === "function"
    ? (vinextHandler as unknown as FetchHandler)
    : ((vinextHandler as unknown as { fetch?: FetchHandler }).fetch as FetchHandler);

const worker = {
  fetch: fetchHandler,
  async scheduled(_event: unknown, env: Record<string, unknown>, ctx: unknown) {
    const secret = typeof env.CRON_SECRET === "string" ? env.CRON_SECRET : "";
    if (secret.length < 32) {
      throw new Error("Brief notification retry requires a valid CRON_SECRET.");
    }

    const request = new Request("https://internal/api/brief/retry-notifications", {
      method: "GET",
      headers: { authorization: `Bearer ${secret}` },
    });

    let response: Response;
    try {
      response = await fetchHandler(request, env, ctx);
    } catch {
      throw new Error("Brief notification retry request failed.");
    }

    if (!response.ok) {
      throw new Error(`Brief notification retry returned HTTP ${response.status}.`);
    }

    const summary = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    const counts = {
      retried: summary?.retried,
      sent: summary?.sent,
      pending: summary?.pending,
      needsReview: summary?.needsReview,
    };
    if (!Object.values(counts).every((count) => typeof count === "number" && Number.isSafeInteger(count) && count >= 0)) {
      throw new Error("Brief notification retry returned an invalid summary.");
    }

    console.info({ message: "Brief notification retry completed.", ...counts });
  },
};

export default worker;


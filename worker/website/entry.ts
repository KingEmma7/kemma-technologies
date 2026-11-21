import vinextHandler from "vinext/server/fetch-handler";

type FetchHandler = (request: Request, env: unknown, ctx: unknown) => Response | Promise<Response>;

const fetchHandler: FetchHandler =
  typeof vinextHandler === "function"
    ? (vinextHandler as unknown as FetchHandler)
    : ((vinextHandler as unknown as { fetch?: FetchHandler }).fetch as FetchHandler);

export default {
  fetch: fetchHandler,
  async scheduled(_event: unknown, env: Record<string, unknown>, ctx: unknown) {
    const secret = typeof env.CRON_SECRET === "string" ? env.CRON_SECRET : "";
    if (secret.length < 32) return;

    await fetchHandler(
      new Request("https://internal/api/brief/retry-notifications", {
        method: "GET",
        headers: { authorization: `Bearer ${secret}` },
      }),
      env,
      ctx,
    );
  },
};


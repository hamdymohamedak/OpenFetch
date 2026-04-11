import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient, createRetryMiddleware } from "../dist/index.js";

/**
 * Per-attempt client `timeout` is applied inside the retry loop via `timeoutPerAttemptMs`.
 * Here we only assert retries still succeed when that option is set (fresh dispatch per attempt).
 */
test("retry with timeoutPerAttemptMs completes after transient 503", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    if (calls === 1) {
      return new Response("", { status: 503 });
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    const client = createClient({
      middlewares: [
        createRetryMiddleware({
          maxAttempts: 3,
          baseDelayMs: 5,
          maxDelayMs: 20,
          timeoutPerAttemptMs: 10_000,
        }),
      ],
      unwrapResponse: true,
    });

    const data = await client.request("http://example.test/rto", {
      url: "http://example.test/rto",
      responseType: "json",
    });
    assert.deepEqual(data, { ok: true });
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

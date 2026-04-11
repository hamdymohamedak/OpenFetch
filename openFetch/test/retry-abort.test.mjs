import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient, createRetryMiddleware, OpenFetchError } from "../dist/index.js";

test("external abort stops retry loop during backoff (no extra fetch)", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response("", { status: 503 });
  };

  try {
    const ac = new AbortController();
    const client = createClient({
      middlewares: [
        createRetryMiddleware({
          maxAttempts: 5,
          baseDelayMs: 200,
          maxDelayMs: 200,
        }),
      ],
      signal: ac.signal,
    });

    const p = client.request("http://example.test/retry-abort", {
      url: "http://example.test/retry-abort",
    });

    await new Promise((r) => setTimeout(r, 30));
    ac.abort();

    await assert.rejects(p, (err) => {
      assert.ok(err instanceof OpenFetchError);
      assert.equal(err.code, "ERR_CANCELED");
      return true;
    });

    assert.equal(calls, 1, "only first attempt before abort during backoff");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("aborted signal before start throws without fetch", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response("ok");
  };
  try {
    const ac = new AbortController();
    ac.abort();
    const client = createClient({
      middlewares: [createRetryMiddleware({ maxAttempts: 3 })],
      signal: ac.signal,
    });
    await assert.rejects(
      client.request("http://example.test/pre-abort", {
        url: "http://example.test/pre-abort",
      }),
      (e) => e instanceof OpenFetchError && e.code === "ERR_CANCELED"
    );
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

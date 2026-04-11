import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient, createRetryMiddleware, hooks } from "../dist/index.js";

test("middleware: outer wraps retry; inner runs each attempt", async () => {
  const originalFetch = globalThis.fetch;
  const events = [];
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    if (calls === 1) return new Response("", { status: 503 });
    return new Response('"ok"', {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    const outer = async (ctx, next) => {
      events.push("outer-in");
      await next();
      events.push("outer-out");
    };
    const inner = async (ctx, next) => {
      events.push("inner-in");
      await next();
      events.push("inner-out");
    };

    const client = createClient({
      middlewares: [
        outer,
        createRetryMiddleware({ maxAttempts: 3, baseDelayMs: 5, maxDelayMs: 20 }),
        inner,
      ],
      unwrapResponse: true,
      responseType: "json",
    });

    const data = await client.request("http://example.test/order", {
      url: "http://example.test/order",
    });
    assert.equal(data, "ok");
    assert.equal(calls, 2);

    assert.deepEqual(events, [
      "outer-in",
      "inner-in",
      "inner-in",
      "inner-out",
      "outer-out",
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("hooks outside retry: onRequest once per client call; inside runs per attempt", async () => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    if (fetchCalls === 1) return new Response("", { status: 503 });
    return new Response("{}", {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    const reqOuter = [];
    const reqInner = [];
    const client = createClient({
      middlewares: [
        hooks({
          onRequest: () => {
            reqOuter.push("h-out");
          },
        }),
        createRetryMiddleware({ maxAttempts: 3, baseDelayMs: 5, maxDelayMs: 20 }),
        hooks({
          onRequest: () => {
            reqInner.push("h-in");
          },
        }),
      ],
      unwrapResponse: true,
      responseType: "json",
    });

    await client.request("http://example.test/hooks-order", {
      url: "http://example.test/hooks-order",
    });

    assert.deepEqual(reqOuter, ["h-out"]);
    assert.deepEqual(reqInner, ["h-in", "h-in"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createClient,
  createFluentClient,
  createRetryMiddleware,
  hooks,
  isHTTPError,
  isSchemaValidationError,
  isTimeoutError,
  OpenFetchError,
  OpenFetchForceRetry,
  SchemaValidationError,
} from "../dist/index.js";

function testSchema(issues) {
  return {
    "~standard": {
      version: 1,
      vendor: "test",
      validate(value) {
        if (issues.length === 0) {
          return { value };
        }
        return { issues };
      },
    },
  };
}

test("throwHttpErrors function: 404 not thrown when gate returns false for 404", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response('{"x":1}', {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  try {
    const client = createClient({
      throwHttpErrors: (status) => status !== 404,
      responseType: "json",
    });
    const res = await client.request("http://parity.test/nope", {
      unwrapResponse: false,
    });
    assert.equal(res.status, 404);
    assert.deepEqual(res.data, { x: 1 });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("validateStatus wins over throwHttpErrors", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response("", { status: 404, headers: { "content-type": "text/plain" } });
  try {
    const client = createClient({
      throwHttpErrors: () => false,
      validateStatus: () => false,
    });
    await assert.rejects(
      () => client.request("http://parity.test/x", { unwrapResponse: false }),
      (e) => e instanceof OpenFetchError && e.code === "ERR_BAD_RESPONSE"
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("jsonSchema validates after successful status", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response('{"a":1}', {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  try {
    const client = createClient({ responseType: "json" });
    await assert.rejects(
      () =>
        client.request("http://parity.test/j", {
          jsonSchema: testSchema([{ message: "nope" }]),
          unwrapResponse: true,
        }),
      (e) => isSchemaValidationError(e)
    );
    const ok = await client.request("http://parity.test/j2", {
      jsonSchema: testSchema([]),
      unwrapResponse: true,
    });
    assert.deepEqual(ok, { a: 1 });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("init runs before fetch and can mutate headers", async () => {
  const originalFetch = globalThis.fetch;
  let headerIn;
  globalThis.fetch = async (_url, init) => {
    headerIn = init.headers["x-init"];
    return new Response("{}", {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const client = createClient({
      responseType: "json",
      init: [
        (cfg) => {
          cfg.headers = { ...(cfg.headers ?? {}), "x-init": "1" };
        },
      ],
    });
    await client.request("http://parity.test/i", { unwrapResponse: true });
    assert.equal(headerIn, "1");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Request as input merges with overrides", async () => {
  const originalFetch = globalThis.fetch;
  let seenMethod;
  globalThis.fetch = async (_url, init) => {
    seenMethod = init.method;
    return new Response("{}", {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const client = createClient({ responseType: "json" });
    const req = new Request("http://parity.test/from-req", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ z: 2 }),
    });
    await client.request(req, { method: "PUT" });
    assert.equal(seenMethod, "PUT");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("per-attempt timeout yields ERR_TIMEOUT and isTimeoutError", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    const signal = init?.signal;
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        resolve(
          new Response("{}", {
            status: 200,
            headers: { "content-type": "application/json" },
          })
        );
      }, 500);
      if (signal) {
        signal.addEventListener(
          "abort",
          () => {
            clearTimeout(t);
            reject(new DOMException("Aborted", "AbortError"));
          },
          { once: true }
        );
      }
    });
  };
  try {
    const client = createClient({ responseType: "json" });
    await assert.rejects(
      () =>
        client.request("http://parity.test/slow", {
          timeout: 20,
          unwrapResponse: true,
        }),
      (e) =>
        e instanceof OpenFetchError &&
        e.code === "ERR_TIMEOUT" &&
        isTimeoutError(e)
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("isHTTPError on ERR_BAD_RESPONSE", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("", { status: 500 });
  try {
    const client = createClient();
    await assert.rejects(
      () => client.request("http://parity.test/500"),
      (e) => isHTTPError(e)
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fluent .json(schema) validates", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response('{"k":1}', {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  try {
    const fluent = createFluentClient();
    await assert.rejects(
      () =>
        fluent("http://parity.test/f").json(testSchema([{ message: "bad" }])),
      (e) => e instanceof SchemaValidationError
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("retry onAfterResponse OpenFetchForceRetry triggers second fetch", async () => {
  const originalFetch = globalThis.fetch;
  let n = 0;
  globalThis.fetch = async () => {
    n += 1;
    if (n === 1) {
      return new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response('{"ok":true}', {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const client = createClient({
      middlewares: [
        createRetryMiddleware({
          maxAttempts: 3,
          baseDelayMs: 2,
          maxDelayMs: 10,
          onAfterResponse: async (_ctx, res) => {
            if (n === 1 && res.data && typeof res.data === "object" && !("ok" in res.data)) {
              throw new OpenFetchForceRetry();
            }
          },
        }),
      ],
      responseType: "json",
      unwrapResponse: true,
    });
    const data = await client.request("http://parity.test/retry-force");
    assert.deepEqual(data, { ok: true });
    assert.equal(n, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("hooks onBeforeRetry merged into retry", async () => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  const before = [];
  globalThis.fetch = async () => {
    fetchCalls += 1;
    if (fetchCalls === 1) {
      return new Response("", { status: 503 });
    }
    return new Response("{}", {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const client = createClient({
      middlewares: [
        hooks({
          onBeforeRetry: async () => {
            before.push("h");
          },
        }),
        createRetryMiddleware({ maxAttempts: 3, baseDelayMs: 2, maxDelayMs: 10 }),
      ],
      responseType: "json",
      unwrapResponse: true,
    });
    await client.request("http://parity.test/hooks-br");
    assert.deepEqual(before, ["h"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("responseType json sets Accept when absent", async () => {
  const originalFetch = globalThis.fetch;
  let accept;
  globalThis.fetch = async (_url, init) => {
    accept = init.headers.accept ?? init.headers.Accept;
    return new Response("{}", {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const client = createClient({ responseType: "json" });
    await client.request("http://parity.test/acc", { unwrapResponse: true });
    assert.equal(accept, "application/json");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

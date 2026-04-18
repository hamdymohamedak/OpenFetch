/**
 * Security-focused checks for @hamdymohamedak/openfetch.
 * Run from package root: npm run test:security
 */
import assert from "node:assert/strict";
import http from "node:http";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, "..", "dist");

const { mergeConfig } = await import(path.join(dist, "shared", "mergeConfig.js"));
const { buildURL } = await import(path.join(dist, "shared", "buildURL.js"));
const mod = await import(path.join(dist, "index.js"));
const {
  createClient,
  createFluentClient,
  isOpenFetchError,
  MemoryCacheStore,
  createCacheMiddleware,
  createRetryMiddleware,
  assertSafeHttpUrl,
  OpenFetchError,
  retry,
} = mod;
const timeoutPlugin = mod.timeout;

let passed = 0;
let failed = 0;

async function check(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`PASS  ${name}`);
  } catch (e) {
    failed++;
    console.error(`FAIL  ${name}`);
    console.error(e);
  }
}

async function main() {
  await check(
    "mergeConfig removes prototype-pollution keys from merged object",
    async () => {
      const malicious = JSON.parse(
        '{"__proto__":{"polluted":true},"constructor":{"x":1},"url":"http://x"}'
      );
      const r = mergeConfig({}, malicious);
      assert.equal(
        Object.prototype.hasOwnProperty.call(r, "__proto__"),
        false
      );
      assert.equal(
        Object.prototype.hasOwnProperty.call(r, "constructor"),
        false
      );
      assert.equal(r.url, "http://x");
    }
  );

  await check("mergeConfig removes dangerous header names", async () => {
    const headers = { "x-safe": "1" };
    headers["__proto__"] = "ignored";
    headers["constructor"] = "ignored";
    const r = mergeConfig({}, { headers });
    assert.equal(r.headers["x-safe"], "1");
    assert.equal(
      Object.prototype.hasOwnProperty.call(r.headers, "__proto__"),
      false
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(r.headers, "constructor"),
      false
    );
  });

  await check(
    "mergeConfig removes dangerous keys from merged retry and memoryCache",
    async () => {
      const malicious = JSON.parse(
        '{"retry":{"maxAttempts":2,"__proto__":{"polluted":true}},"memoryCache":{"ttlMs":1,"constructor":{"x":1}}}'
      );
      const r = mergeConfig({}, malicious);
      assert.equal(r.retry?.maxAttempts, 2);
      assert.equal(
        Object.prototype.hasOwnProperty.call(r.retry ?? {}, "__proto__"),
        false
      );
      assert.equal(
        Object.prototype.hasOwnProperty.call(r.retry ?? {}, "constructor"),
        false
      );
      assert.equal(r.memoryCache?.ttlMs, 1);
      assert.equal(
        Object.prototype.hasOwnProperty.call(r.memoryCache ?? {}, "constructor"),
        false
      );
    }
  );

  await check(
    "mergeConfig strips dangerous keys from Object.create(null) headers",
    async () => {
      const headers = Object.create(null);
      headers["x-safe"] = "1";
      headers["__proto__"] = "ignored";
      headers["constructor"] = "ignored";
      const r = mergeConfig({}, { headers });
      assert.equal(r.headers["x-safe"], "1");
      assert.equal(
        Object.prototype.hasOwnProperty.call(r.headers, "__proto__"),
        false
      );
      assert.equal(
        Object.prototype.hasOwnProperty.call(r.headers, "constructor"),
        false
      );
    }
  );

  await check("mergeConfig chained merge drops pollution keys", async () => {
    const first = JSON.parse(
      '{"__proto__":{"polluted":true},"constructor":{"x":1},"url":"http://a"}'
    );
    const second = { url: "http://b" };
    const r = mergeConfig(mergeConfig({}, first), second);
    assert.equal(r.url, "http://b");
    assert.equal(Object.prototype.hasOwnProperty.call(r, "__proto__"), false);
    assert.equal(Object.prototype.hasOwnProperty.call(r, "constructor"), false);
  });

  await check(
    "fetch rejects newline in header values (injection hardening)",
    async () => {
      const client = createClient({ baseURL: "http://127.0.0.1:9" });
      await assert.rejects(
        async () => {
          await client.get("/nope", {
            headers: { "X-Test": "a\r\nX-Injected: 1" },
          });
        },
        (e) =>
          e instanceof TypeError ||
          (isOpenFetchError(e) && typeof e.message === "string")
      );
    }
  );

  await check("OpenFetchError.toShape omits auth secrets from serialized shape", async () => {
    const client = createClient({
      baseURL: "http://127.0.0.1:9",
      auth: { username: "u", password: "SECRET_PASSWORD" },
    });
    try {
      await client.get("/unreachable");
      assert.fail("expected connection error");
    } catch (e) {
      if (isOpenFetchError(e)) {
        const shape = e.toShape();
        const s = JSON.stringify(shape);
        assert.equal(s.includes("SECRET_PASSWORD"), false);
        assert.equal(s.includes("Basic "), false);
        assert.ok(e.config?.auth, "raw error may still hold config for logging only");
      }
    }
  });

  await check(
    "memory cache varyHeaderNames separates entries by Authorization",
    async () => {
      const store = new MemoryCacheStore({ maxEntries: 10 });
      let hits = 0;
      const server = http.createServer((_req, res) => {
        hits++;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end("{}");
      });
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      const { port } = server.address();
      try {
        const cached = createClient({
          baseURL: `http://127.0.0.1:${port}`,
          middlewares: [
            createCacheMiddleware(store, {
              ttlMs: 60_000,
              varyHeaderNames: ["authorization"],
            }),
          ],
        });
        await cached.get("/same-path", {
          headers: { Authorization: "Bearer a" },
        });
        await cached.get("/same-path", {
          headers: { Authorization: "Bearer b" },
        });
        assert.equal(hits, 2);
      } finally {
        server.close();
        await new Promise((r) => server.once("close", r));
      }
    }
  );

  await check(
    "memory cache varyHeaderNames matches Authorization case-insensitively",
    async () => {
      const store = new MemoryCacheStore({ maxEntries: 10 });
      let hits = 0;
      const server = http.createServer((_req, res) => {
        hits++;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end("{}");
      });
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      const { port } = server.address();
      try {
        const cached = createClient({
          baseURL: `http://127.0.0.1:${port}`,
          middlewares: [
            createCacheMiddleware(store, {
              ttlMs: 60_000,
              varyHeaderNames: ["authorization"],
            }),
          ],
        });
        await cached.get("/vary-case", {
          headers: { AUTHORIZATION: "Bearer a" },
        });
        await cached.get("/vary-case", {
          headers: { authorization: "Bearer b" },
        });
        assert.equal(hits, 2);
      } finally {
        server.close();
        await new Promise((r) => server.once("close", r));
      }
    }
  );

  await check(
    "memory cache custom key separates tenants on same path",
    async () => {
      const store = new MemoryCacheStore({ maxEntries: 10 });
      let hits = 0;
      const server = http.createServer((_req, res) => {
        hits++;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end("{}");
      });
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      const { port } = server.address();
      try {
        const cached = createClient({
          baseURL: `http://127.0.0.1:${port}`,
          middlewares: [
            createCacheMiddleware(store, {
              ttlMs: 60_000,
              key: ({ request }) => {
                const t = request.headers?.["x-tenant"] ?? "none";
                return `tenant:${t}`;
              },
            }),
          ],
        });
        await cached.get("/api", { headers: { "x-tenant": "a" } });
        await cached.get("/api", { headers: { "x-tenant": "b" } });
        assert.equal(hits, 2);
        await cached.get("/api", { headers: { "x-tenant": "a" } });
        assert.equal(hits, 2);
      } finally {
        server.close();
        await new Promise((r) => server.once("close", r));
      }
    }
  );

  await check("memory cache does not re-hit origin for identical GET", async () => {
    const store = new MemoryCacheStore({ maxEntries: 10 });
    let hits = 0;
    const server = http.createServer((_req, res) => {
      hits++;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end("{}");
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();
    try {
      const cached = createClient({
        baseURL: `http://127.0.0.1:${port}`,
        middlewares: [createCacheMiddleware(store, { ttlMs: 60_000 })],
      });
      await cached.get("/cached-path");
      assert.equal(hits, 1);
      await cached.get("/cached-path");
      assert.equal(hits, 1);
    } finally {
      server.close();
      await new Promise((r) => server.once("close", r));
    }
  });

  await check("assertSafeHttpUrl blocks loopback IPv4 literal", async () => {
    assert.throws(() => assertSafeHttpUrl("http://127.0.0.1/foo"), /openfetch/);
  });

  await check("assertSafeHttpUrl allows public https URL", async () => {
    assertSafeHttpUrl("https://example.com/path");
  });

  await check("createClient assertSafeUrl blocks private literal host", async () => {
    const client = createClient({
      assertSafeUrl: true,
      baseURL: "http://127.0.0.1:9",
    });
    await assert.rejects(
      () => client.get("/x"),
      (e) =>
        e instanceof Error &&
        /openfetch:\s*assertSafeHttpUrl|private|blocked|localhost/i.test(e.message)
    );
  });

  await check(
    "assertSafeHttpUrl blocks Node-normalized decimal and hex loopback hosts",
    async () => {
      assert.throws(() => assertSafeHttpUrl("http://2130706433/"), /openfetch/);
      assert.throws(() => assertSafeHttpUrl("http://3232235777/"), /openfetch/);
      assert.throws(() => assertSafeHttpUrl("http://0x7f.0.0.1/"), /openfetch/);
      assert.throws(() => assertSafeHttpUrl("http://127.1/"), /openfetch/);
    }
  );

  await check(
    "assertSafeHttpUrl rejects non-http(s) schemes",
    async () => {
      assert.throws(() => assertSafeHttpUrl("file:///etc/passwd"), /openfetch/);
      assert.throws(
        () => assertSafeHttpUrl("javascript:alert(1)"),
        /openfetch/
      );
    }
  );

  await check(
    "retry does not repeat POST on retryable HTTP status by default",
    async () => {
      let hits = 0;
      const server = http.createServer((_req, res) => {
        hits++;
        res.writeHead(503);
        res.end();
      });
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      const { port } = server.address();
      try {
        const client = createClient({
          baseURL: `http://127.0.0.1:${port}`,
          middlewares: [createRetryMiddleware({ maxAttempts: 5 })],
        });
        await assert.rejects(() => client.post("/x", {}));
        assert.equal(hits, 1);
      } finally {
        server.close();
        await new Promise((r) => server.once("close", r));
      }
    }
  );

  await check(
    "retry does not run fetch when signal is already aborted",
    async () => {
      let hits = 0;
      const server = http.createServer((_req, res) => {
        hits++;
        res.writeHead(503);
        res.end();
      });
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      const { port } = server.address();
      try {
        const ac = new AbortController();
        ac.abort();
        const client = createClient({
          baseURL: `http://127.0.0.1:${port}`,
          middlewares: [createRetryMiddleware({ maxAttempts: 10 })],
        });
        await assert.rejects(
          () => client.get("/x", { signal: ac.signal }),
          (e) => isOpenFetchError(e) && e.code === "ERR_CANCELED"
        );
        assert.equal(hits, 0);
      } finally {
        server.close();
        await new Promise((r) => server.once("close", r));
      }
    }
  );

  await check(
    "retry skips further attempts when signal aborted during backoff",
    async () => {
      let hits = 0;
      const ac = new AbortController();
      const server = http.createServer((_req, res) => {
        hits++;
        res.writeHead(503);
        res.end();
      });
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      const { port } = server.address();
      try {
        const client = createClient({
          baseURL: `http://127.0.0.1:${port}`,
          middlewares: [
            createRetryMiddleware({
              maxAttempts: 10,
              baseDelayMs: 200,
              maxDelayMs: 200,
            }),
          ],
        });
        const p = client.get("/x", { signal: ac.signal });
        for (let i = 0; i < 80 && hits < 1; i++) {
          await new Promise((r) => setTimeout(r, 25));
        }
        assert.equal(hits, 1);
        ac.abort();
        await assert.rejects(
          () => p,
          (e) => isOpenFetchError(e) && e.code === "ERR_CANCELED"
        );
        assert.equal(hits, 1);
      } finally {
        server.close();
        await new Promise((r) => server.once("close", r));
      }
    }
  );

  await check(
    "retry repeats GET on retryable HTTP status up to maxAttempts",
    async () => {
      let hits = 0;
      const server = http.createServer((_req, res) => {
        hits++;
        res.writeHead(503);
        res.end();
      });
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      const { port } = server.address();
      try {
        const client = createClient({
          baseURL: `http://127.0.0.1:${port}`,
          middlewares: [createRetryMiddleware({ maxAttempts: 5 })],
        });
        await assert.rejects(() => client.get("/x"));
        assert.equal(hits, 5);
      } finally {
        server.close();
        await new Promise((r) => server.once("close", r));
      }
    }
  );

  await check(
    "retry sets stable Idempotency-Key for POST when retryNonIdempotentMethods",
    async () => {
      const keys = [];
      const server = http.createServer((req, res) => {
        keys.push(req.headers["idempotency-key"] ?? "");
        res.writeHead(503);
        res.end();
      });
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      const { port } = server.address();
      try {
        const client = createClient({
          baseURL: `http://127.0.0.1:${port}`,
          middlewares: [
            createRetryMiddleware({
              maxAttempts: 3,
              retryNonIdempotentMethods: true,
            }),
          ],
        });
        await assert.rejects(() => client.post("/pay", { amount: 1 }));
        assert.equal(keys.length, 3);
        assert.ok(keys[0].length > 0);
        assert.equal(keys[0], keys[1]);
        assert.equal(keys[1], keys[2]);
      } finally {
        server.close();
        await new Promise((r) => server.once("close", r));
      }
    }
  );

  await check(
    "retry preserves caller Idempotency-Key for POST retries",
    async () => {
      const keys = [];
      const server = http.createServer((req, res) => {
        keys.push(req.headers["idempotency-key"] ?? "");
        res.writeHead(503);
        res.end();
      });
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      const { port } = server.address();
      try {
        const client = createClient({
          baseURL: `http://127.0.0.1:${port}`,
          middlewares: [
            createRetryMiddleware({
              maxAttempts: 2,
              retryNonIdempotentMethods: true,
            }),
          ],
        });
        await assert.rejects(() =>
          client.post(
            "/pay",
            {},
            { headers: { "Idempotency-Key": "stripe-style-key" } }
          )
        );
        assert.equal(keys.length, 2);
        assert.equal(keys[0], "stripe-style-key");
        assert.equal(keys[1], "stripe-style-key");
      } finally {
        server.close();
        await new Promise((r) => server.once("close", r));
      }
    }
  );

  await check(
    "retry does not inject Idempotency-Key when autoIdempotencyKey is false",
    async () => {
      const keys = [];
      const server = http.createServer((req, res) => {
        keys.push(req.headers["idempotency-key"] ?? "");
        res.writeHead(503);
        res.end();
      });
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      const { port } = server.address();
      try {
        const client = createClient({
          baseURL: `http://127.0.0.1:${port}`,
          middlewares: [
            createRetryMiddleware({
              maxAttempts: 2,
              retryNonIdempotentMethods: true,
              autoIdempotencyKey: false,
            }),
          ],
        });
        await assert.rejects(() => client.post("/pay", {}));
        assert.equal(keys.length, 2);
        assert.equal(keys[0], "");
        assert.equal(keys[1], "");
      } finally {
        server.close();
        await new Promise((r) => server.once("close", r));
      }
    }
  );

  await check(
    "OpenFetchError.toShape redacts sensitive query params in url by default",
    async () => {
      const cfg = {
        url: "http://127.0.0.1/x?token=SECRET&ok=1",
        method: "GET",
      };
      const err = new OpenFetchError("bad", { config: cfg });
      const shape = err.toShape();
      assert.equal(shape.url.includes("SECRET"), false);
      assert.match(shape.url, /REDACTED/);
      assert.ok(shape.url.includes("ok=1"));
      const full = err.toShape({ redactSensitiveUrlQuery: false });
      assert.ok(full.url.includes("SECRET"));
    }
  );

  await check(
    "createCacheMiddleware default vary isolates Authorization (no warn)",
    async () => {
      const warnings = [];
      const orig = console.warn;
      console.warn = (...args) => {
        warnings.push(args.join(" "));
      };
      const store = new MemoryCacheStore({ maxEntries: 10 });
      let hits = 0;
      const server = http.createServer((_req, res) => {
        hits++;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end("{}");
      });
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      const { port } = server.address();
      try {
        const cached = createClient({
          baseURL: `http://127.0.0.1:${port}`,
          middlewares: [createCacheMiddleware(store, { ttlMs: 60_000 })],
        });
        await cached.get("/isolated-path", {
          headers: { Authorization: "Bearer a" },
        });
        await cached.get("/isolated-path", {
          headers: { Authorization: "Bearer b" },
        });
        assert.equal(warnings.length, 0);
        assert.equal(hits, 2);
      } finally {
        console.warn = orig;
        server.close();
        await new Promise((r) => server.once("close", r));
      }
    }
  );

  await check(
    "createCacheMiddleware warns once when varyHeaderNames explicitly [] with auth",
    async () => {
      const warnings = [];
      const orig = console.warn;
      console.warn = (...args) => {
        warnings.push(args.join(" "));
      };
      const store = new MemoryCacheStore({ maxEntries: 10 });
      let hits = 0;
      const server = http.createServer((_req, res) => {
        hits++;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end("{}");
      });
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      const { port } = server.address();
      try {
        const cached = createClient({
          baseURL: `http://127.0.0.1:${port}`,
          middlewares: [
            createCacheMiddleware(store, {
              ttlMs: 60_000,
              varyHeaderNames: [],
            }),
          ],
        });
        await cached.get("/warn-path", {
          headers: { Authorization: "Bearer a" },
        });
        await cached.get("/warn-path", {
          headers: { Authorization: "Bearer b" },
        });
        assert.equal(warnings.length, 1);
        assert.ok(warnings[0].includes("openfetch"));
        assert.equal(hits, 1);
      } finally {
        console.warn = orig;
        server.close();
        await new Promise((r) => server.once("close", r));
      }
    }
  );

  await check(
    "OpenFetchError.toShape omits response data and headers by default",
    async () => {
      const cfg = { url: "http://127.0.0.1/x", method: "GET" };
      const err = new OpenFetchError("bad", {
        config: cfg,
        response: {
          data: { token: "LEAK" },
          status: 400,
          statusText: "Bad Request",
          headers: { "x-token": "SECRET_HEADER" },
          config: cfg,
        },
      });
      const s0 = JSON.stringify(err.toShape());
      assert.equal(s0.includes("LEAK"), false);
      assert.equal(s0.includes("SECRET_HEADER"), false);
      const s1 = JSON.stringify(err.toJSON());
      assert.equal(s1.includes("LEAK"), false);
      assert.equal(s1.includes("SECRET_HEADER"), false);
      const s2 = JSON.stringify(
        err.toShape({ includeResponseData: true, includeResponseHeaders: true })
      );
      assert.ok(s2.includes("LEAK"));
      assert.ok(s2.includes("SECRET_HEADER"));
    }
  );

  await check("client.use returns same client for chaining", async () => {
    const c = createClient();
    const noop = async (_ctx, next) => {
      await next();
    };
    assert.equal(c.use(noop), c);
  });

  await check("retry plugin maps attempts to maxAttempts", async () => {
    let hits = 0;
    const server = http.createServer((_req, res) => {
      hits++;
      res.writeHead(503);
      res.end();
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();
    try {
      const client = createClient({
        baseURL: `http://127.0.0.1:${port}`,
        middlewares: [retry({ attempts: 2 })],
      });
      await assert.rejects(() => client.get("/x"));
      assert.equal(hits, 2);
    } finally {
      server.close();
      await new Promise((r) => server.once("close", r));
    }
  });

  await check("timeout plugin aborts slow responses", async () => {
    const server = http.createServer((_req, res) => {
      setTimeout(() => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end("{}");
      }, 200);
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();
    try {
      const client = createClient({
        baseURL: `http://127.0.0.1:${port}`,
        middlewares: [timeoutPlugin(40)],
      });
      await assert.rejects(() => client.get("/slow"), (e) => isOpenFetchError(e));
    } finally {
      server.close();
      await new Promise((r) => server.once("close", r));
    }
  });

  await check("createFluentClient json() returns parsed body", async () => {
    const server = http.createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ fluent: 1 }));
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();
    try {
      const client = createFluentClient({
        baseURL: `http://127.0.0.1:${port}`,
      });
      const data = await client("/x").json();
      assert.deepEqual(data, { fluent: 1 });
    } finally {
      server.close();
      await new Promise((r) => server.once("close", r));
    }
  });

  await check("createFluentClient raw() returns unread native Response", async () => {
    const server = http.createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ raw: 1 }));
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();
    try {
      const client = createFluentClient({
        baseURL: `http://127.0.0.1:${port}`,
      });
      const r = await client("/z").get().raw();
      assert.ok(r.ok);
      assert.deepEqual(await r.json(), { raw: 1 });
    } finally {
      server.close();
      await new Promise((r) => server.once("close", r));
    }
  });

  await check("retry timeoutTotalMs throws ERR_RETRY_TIMEOUT before maxAttempts", async () => {
    let hits = 0;
    const server = http.createServer((_req, res) => {
      hits++;
      res.writeHead(503);
      res.end();
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();
    try {
      const client = createClient({
        baseURL: `http://127.0.0.1:${port}`,
        middlewares: [
          createRetryMiddleware({
            maxAttempts: 40,
            baseDelayMs: 80,
            maxDelayMs: 80,
            timeoutTotalMs: 200,
          }),
        ],
      });
      await assert.rejects(
        () => client.get("/x"),
        (e) => isOpenFetchError(e) && e.code === "ERR_RETRY_TIMEOUT"
      );
      assert.ok(hits >= 1 && hits < 40);
    } finally {
      server.close();
      await new Promise((r) => server.once("close", r));
    }
  });

  await check("retry timeoutTotalMs aborts in-flight fetch (slow response)", async () => {
    let hits = 0;
    const server = http.createServer((_req, res) => {
      hits++;
      setTimeout(() => {
        res.writeHead(200);
        res.end("{}");
      }, 800);
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();
    try {
      const client = createClient({
        baseURL: `http://127.0.0.1:${port}`,
        middlewares: [
          createRetryMiddleware({
            maxAttempts: 5,
            baseDelayMs: 50,
            timeoutTotalMs: 200,
            enforceTotalTimeout: true,
          }),
        ],
      });
      const t0 = Date.now();
      await assert.rejects(
        () => client.get("/x"),
        (e) => isOpenFetchError(e) && e.code === "ERR_RETRY_TIMEOUT"
      );
      const elapsed = Date.now() - t0;
      assert.ok(elapsed < 700, `expected deadline abort ~200ms, got ${elapsed}ms`);
      assert.equal(hits, 1);
    } finally {
      server.close();
      await new Promise((r) => server.once("close", r));
    }
  });

  await check("retry enforceTotalTimeout false does not abort in-flight past budget", async () => {
    let hits = 0;
    const server = http.createServer((_req, res) => {
      hits++;
      setTimeout(() => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: 1 }));
      }, 400);
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address();
    try {
      const client = createClient({
        baseURL: `http://127.0.0.1:${port}`,
        middlewares: [
          createRetryMiddleware({
            maxAttempts: 3,
            timeoutTotalMs: 200,
            enforceTotalTimeout: false,
          }),
        ],
      });
      const res = await client.get("/x");
      assert.deepEqual(res.data, { ok: 1 });
      assert.equal(hits, 1);
    } finally {
      server.close();
      await new Promise((r) => server.once("close", r));
    }
  });

  await check("buildURL stays fast on long paths (ReDoS sanity)", async () => {
    const longPath = "/api/" + "a".repeat(50_000);
    const t0 = Date.now();
    const u = buildURL(longPath, { baseURL: "http://127.0.0.1:1" });
    const ms = Date.now() - t0;
    assert.ok(ms < 500, `buildURL took ${ms}ms`);
    assert.ok(u.includes("aaaa"));
  });

  console.log(`\nSecurity checks: ${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main();

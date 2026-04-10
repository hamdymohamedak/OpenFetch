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

const { mergeConfig } = await import(path.join(dist, "helpers", "mergeConfig.js"));
const { buildURL } = await import(path.join(dist, "helpers", "buildURL.js"));
const {
  createClient,
  isOpenFetchError,
  MemoryCacheStore,
  createCacheMiddleware,
  createRetryMiddleware,
  assertSafeHttpUrl,
  OpenFetchError,
} = await import(path.join(dist, "index.js"));

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
    "OpenFetchError.toShape can omit response data and headers",
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
      const s1 = JSON.stringify(err.toShape({ includeResponseData: false }));
      assert.equal(s1.includes("LEAK"), false);
      const s2 = JSON.stringify(
        err.toShape({ includeResponseHeaders: false })
      );
      assert.equal(s2.includes("SECRET_HEADER"), false);
    }
  );

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

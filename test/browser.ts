import path from "node:path";
import { fileURLToPath } from "node:url";
import test, { type ExecutionContext } from "ava";
import express from "express";
import { type Page } from "playwright";
import type { OpenFetchClient } from "../src/domain/types.js";
import {
  createHttpTestServer,
  type ExtendedHttpTestServer,
  type HttpServerOptions,
} from "./helpers/create-http-test-server.js";
import { defaultBrowsersTest } from "./helpers/with-page.js";

declare global {
  interface Window {
    openFetch: OpenFetchClient;
  }
}

const distPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "dist"
);

const createEsmTestServer = async (options?: HttpServerOptions) => {
  const server = await createHttpTestServer(options);
  server.use("/dist", express.static(distPath));
  server.use((_, response, next) => {
    response.set("Connection", "close");
    next();
  });
  return server;
};

/** Load the built ESM bundle via dynamic import (avoids inline-script CSP and extra routes). */
const addOpenFetchToPage = async (page: Page) => {
  await page.evaluate(async () => {
    // Resolved in the browser against the test server origin (not Node resolution).
    const m = await import(
      "/dist/index.js" as `${string}.js`
    );
    globalThis.openFetch = m.default;
  });
  await page.waitForFunction(() => typeof globalThis.openFetch === "object");
};

let server: ExtendedHttpTestServer;

test.beforeEach(async () => {
  server = await createEsmTestServer();
});

test.afterEach(async () => {
  await server.close();
});

defaultBrowsersTest("GET request returns response body", async (t: ExecutionContext, page: Page) => {
  server.get("/", (_request, response) => {
    response.type("html");
    response.end(
      "<!doctype html><html><head><meta charset=\"utf-8\"></head><body></body></html>"
    );
  });
  server.get("/echo", (_request, response) => {
    response.end("unicorn");
  });

  await page.goto(server.url);
  await addOpenFetchToPage(page);

  const text = await page.evaluate(async (origin: string) => {
    return globalThis.openFetch.get(`${origin}/echo`, {
      url: `${origin}/echo`,
      unwrapResponse: true,
      responseType: "text",
    }) as Promise<string>;
  }, server.url);

  t.is(text, "unicorn");
});

defaultBrowsersTest("POST JSON body", async (t: ExecutionContext, page: Page) => {
  server.get("/", (_request, response) => {
    response.type("html");
    response.end(
      "<!doctype html><html><head><meta charset=\"utf-8\"></head><body></body></html>"
    );
  });
  server.post("/api", express.json(), (request, response) => {
    response.json({ echo: request.body });
  });

  await page.goto(server.url);
  await addOpenFetchToPage(page);

  const data = await page.evaluate(async (url: string) => {
    return globalThis.openFetch.post(
      `${url}/api`,
      { hello: "world" },
      { url: `${url}/api`, unwrapResponse: true, responseType: "json" }
    ) as Promise<{ echo: { hello: string } }>;
  }, server.url);

  t.deepEqual(data, { echo: { hello: "world" } });
});

defaultBrowsersTest("aborting a request", async (t: ExecutionContext, page: Page) => {
  server.get("/", (_request, response) => {
    response.type("html");
    response.end(
      "<!doctype html><html><head><meta charset=\"utf-8\"></head><body></body></html>"
    );
  });

  server.get("/slow", (_request, response) => {
    setTimeout(() => {
      response.end("late");
    }, 500);
  });

  await page.goto(server.url);
  await addOpenFetchToPage(page);

  const code = await page.evaluate(async (url: string) => {
    const controller = new AbortController();
    const request = globalThis.openFetch.get(`${url}/slow`, {
      url: `${url}/slow`,
      signal: controller.signal,
      unwrapResponse: true,
      responseType: "text",
    });
    controller.abort();
    return request.catch((error_: unknown) => {
      const e = error_ as { code?: string; name?: string };
      return e.code ?? e.name ?? String(error_);
    });
  }, server.url);

  t.is(code, "ERR_CANCELED");
});

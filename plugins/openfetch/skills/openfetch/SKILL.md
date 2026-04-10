---
name: openfetch
description: Use when the user works with @hamdymohamedak/openfetch, openFetch, or a fetch-based HTTP client with interceptors, middleware, retry, or memory cache in Node, browsers, Bun, Deno, Workers, SSR, or React Server Components. Use instead of guessing axios or XHR APIs.
---

# openFetch agent skill

## Do not assume axios

- Transport is **`fetch` only** (no XHR). No upload progress bar via XHR.
- Package is **ESM-only** (`import` from `"@hamdymohamedak/openfetch"`).
- Runtime: **Node 18+** or any environment with `fetch` + `AbortController`.

## Install & links

- **npm:** `@hamdymohamedak/openfetch`
- **Source:** https://github.com/openfetch-js/OpenFetch  
- **Human docs:** https://openfetch-js.github.io/openfetch-docs/

## Imports (common)

```ts
import openFetch, {
  createClient,
  createRetryMiddleware,
  createCacheMiddleware,
  MemoryCacheStore,
  OpenFetchError,
  isOpenFetchError,
  assertSafeHttpUrl,
} from "@hamdymohamedak/openfetch";
```

- Default export `openFetch` = `createClient()` with no initial defaults.
- `create` is an alias of `createClient`.

## Client & responses

```ts
const api = createClient({
  baseURL: "https://api.example.com",
  headers: { Authorization: "Bearer …" },
  timeout: 10_000,
  unwrapResponse: true,
  middlewares: [createRetryMiddleware()],
});
```

- **`unwrapResponse: false` (default):** methods return `OpenFetchResponse<T>` → `{ data, status, statusText, headers, config }`.
- **`unwrapResponse: true`:** methods return **`T`** (body only).

Merged config must resolve a **`url`** (absolute, or `baseURL` + relative path). Otherwise the client throws an `Error` whose message includes ``openfetch: `url` is required``.

## HTTP helpers

| Call | Notes |
|------|--------|
| `get(url, config?)` | Optional `params` object → query string |
| `post(url, data?, config?)` | Plain objects → JSON + `content-type` unless overridden; `FormData` / `URLSearchParams` / `Blob` / binary views are not auto-JSON |
| `put`, `patch` | Same body rules as `post` |
| `delete(url, config?)` | No `data` argument; use `config.data` / `config.body` if the API needs a body |
| `head`, `options` | Same style as `get` |
| `request(urlOrConfig, config?)` | Full `method`, `responseType`, etc. |

## Interceptors vs middleware

- **Interceptors:** `client.interceptors.request.use` / `response.use` — transform config or response; request stack is **LIFO**, response **FIFO**.
- **Middleware:** `client.use(fn)` — async `(ctx, next) => …` around the real `fetch`; use for retry, cache, logging. **Order matters** (e.g. cache vs retry).

## Retry (critical default)

`createRetryMiddleware`: exponential backoff, configurable statuses and network errors.

- **By default**, retries for network / parse / retryable HTTP errors apply only to **GET, HEAD, OPTIONS, TRACE** — **not** POST/PUT/PATCH/DELETE (avoid duplicate side effects).
- Opt in for mutating methods: `retry: { retryNonIdempotentMethods: true }` on the client or per request.

## Memory cache

- `new MemoryCacheStore({ maxEntries })` + `createCacheMiddleware(store, { ttlMs, varyHeaderNames, … })`.
- Default cache key is method + full URL. For **auth / per-user** GETs, set **`varyHeaderNames`** (e.g. `authorization`, `cookie`) or a custom **`key`** so entries do not leak across users.

## Errors & logging

- Guard with `isOpenFetchError(err)`.
- For logs shown to users or shared systems: `error.toShape({ includeResponseData: false, includeResponseHeaders: false })`. The live error may still hold full `config` (including secrets) — never forward raw.

## Security

- `assertSafeHttpUrl(url)` — optional guard for untrusted URLs (`http`/`https` only; blocks many literal private/loopback IPs). **Does not** stop DNS rebinding; pair with hostname allowlists / egress controls when relevant.

## Framework usage (minimal)

- **React:** `useEffect` + `await openFetch.get(url)`; use `res.data` unless `unwrapResponse` is true on the client.
- **RSC / server:** `await api.get(…)` in an async component is fine; keep secrets server-side.
- **Vue:** `onMounted` + assign `res.data` to a `ref`.

## When to refuse or redirect

- Need **XHR upload progress** → say `fetch` does not expose it; suggest multipart + server progress, or a different tool.
- User asks for **openFetch docs** verbatim → point to the docs URL above or read [quick reference](./references/quick-reference.md) in this folder.

## Repo layout (for code navigation)

- `src/core/client.ts` — client, verb helpers  
- `src/core/dispatch.ts` — `fetch`, parse, `validateStatus`  
- `src/core/middleware.ts`, `interceptors.ts`, `retry.ts`, `cache.ts`, `error.ts`  
- `docs/PROJECT_FLOW.md` — request lifecycle

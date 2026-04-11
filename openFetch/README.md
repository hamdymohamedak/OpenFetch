# @hamdymohamedak/openfetch

A small, dependency-free HTTP client for JavaScript runtimes that expose the standard [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) API. It supports instances with defaults, request and response interceptors, HTTP verb helpers, optional request/response transforms, composable middleware, retries, and in-memory caching—without legacy browser-only globals.

**Design goals**

- One transport: `fetch` only (Node 18+, Bun, Deno, Cloudflare Workers, browsers).
- No polyfills required for supported environments.
- Safe for server rendering and React Server Components: no `window`, `document`, `localStorage`, or framework coupling.

## Installation

```bash
npm install @hamdymohamedak/openfetch
```

Scoped packages are published with `npm publish --access public` the first time. Replace `hamdymohamedak` with your npm username if it differs from GitHub.

Build from a clone:

```bash
npm install
npm run build
```

## Quick start

```ts
import openFetch, { createClient } from "@hamdymohamedak/openfetch";

const { data, status, headers } = await openFetch.get(
  "https://api.example.com/v1/users"
);

const api = createClient({
  baseURL: "https://api.example.com",
  headers: { Authorization: "Bearer <token>" },
  timeout: 10_000,
  unwrapResponse: true,
});

const users = await api.get("/v1/users");
```

## Features

| Area | Details |
|------|---------|
| Instances | `createClient()` / `create()` with mutable `defaults` |
| HTTP verbs | `request`, `get`, `post`, `put`, `patch`, `delete`, `head`, `options` |
| Config | `baseURL`, `params`, `headers`, `timeout`, `signal`, `data` / `body`, `auth`, `responseType`, `rawResponse`, `validateStatus` |
| Interceptors | Request and response stacks (documented call order) |
| Middleware | Async `use()` hooks wrapping the fetch adapter |
| Errors | `OpenFetchError` with `toShape()` / `toJSON()` for structured logging |
| Retry | `createRetryMiddleware()` — backoff, `timeoutTotalMs` / `timeoutPerAttemptMs`, idempotent POST key |
| Cache | `MemoryCacheStore` + `createCacheMiddleware()` (TTL, optional stale-while-revalidate) |
| Plugins | `retry({ attempts })`, `timeout(ms)`, `hooks(...)`, `debug({ maskStrategy: 'partial' \| 'hash', … })`, `strictFetch()` |
| Fluent API | `createFluentClient()` — lazy chain; **each** `.json()` / `.raw()` / … runs **one** request unless you use `.memo()`; `.raw()` → `Response` |

Subpath imports (tree-shaking): `@hamdymohamedak/openfetch/plugins`, `@hamdymohamedak/openfetch/sugar`.

```ts
import { createFluentClient, retry, timeout } from "@hamdymohamedak/openfetch";

const client = createFluentClient({ baseURL: "https://api.example.com" })
  .use(retry({ attempts: 3 }))
  .use(timeout(5000));

const data = await client("/v1/user").json<{ id: string }>();

// Native Response (unread body); second terminal = second HTTP call
const res = await client("/v1/export").get().raw();
const blob = await res.blob();

// One HTTP round-trip, then parse as JSON and as text (body buffered once — not HTTP caching)
const memoed = client("/v1/profile").get().memo();
const profile = await memoed.json();
const rawText = await memoed.text();
```

Register **`retry` before `timeout`** so retries wrap the full inner stack. Use **interceptors** to mutate config/response; use **`hooks`** for side-effect logging around the middleware pipeline.

**Fluent:** `.get()` / `.post()` only build config. **Each terminal** (`.json()`, `.text()`, `.send()`, `.raw()`, …) triggers a **new** `fetch` unless the chain used **`.memo()`** (request-level memoization: one `fetch`, body read once into memory). For two reads of the same native `Response`, use **`cloneResponse(res)`** from the package exports (or `.clone()` on the `Response`).

**`rawResponse` / `.raw()`:** the adapter does **not** read the body and skips **`transformResponse`**. Client **response interceptors** still run (`data` is the native `Response`). Middleware that expects parsed `ctx.response.data` will not see transforms until you parse yourself.

**Retry timing:** `retry.timeoutTotalMs` measures elapsed time with a monotonic clock (`performance.now()` when available), so the budget is not skewed by system clock changes. By default (`retry.enforceTotalTimeout !== false`), each attempt merges a deadline into the request `signal` so an in-flight `fetch` aborts when the budget runs out (`ERR_RETRY_TIMEOUT`). Set `retry.enforceTotalTimeout: false` to enforce the budget only between attempts. `retry.timeoutPerAttemptMs` sets `timeout` for every attempt inside the retry middleware. Each `dispatch` uses `clearTimeout` in a `finally` block so per-attempt timers are not left dangling.

**Debug:** Default logs omit request headers. Use `debug({ includeRequestHeaders: true, maskHeaders: ["authorization"], maskStrategy: "partial" })` for values like `Bearer ****abcd`, or `maskStrategy: "hash"` for a short fingerprint. **`maskHeaderValues`** supports the same strategies when building your own logs.

### Execution model

Understanding order helps avoid surprises with retries, timeouts, and escape hatches.

1. **Request interceptors** run on the merged config (mutations apply to the in-flight request).
2. **Middleware stack** runs in registration order: the **first** `use()` is the **outer** shell; its `next()` enters the next middleware, and the **last** middleware’s `next()` runs the built-in handler that calls **`dispatch`** (`fetch` + parse, unless `rawResponse`).
3. **Inside `dispatch`:** `transformRequest` → `fetch` → (optional body parse) → **`transformResponse`** (skipped when `rawResponse`).
4. **Response interceptors** run on the `OpenFetchResponse` (for `rawResponse`, `data` is still a native `Response`).
5. **Retry** (`createRetryMiddleware` / `retry()`): each retry calls `next()` again, so middleware **below** retry in the stack runs **once per attempt**; middleware **above** retry wraps the whole loop (one outer enter/exit per logical request).
6. **Terminal methods** (fluent `.json()`, `.text()`, client `.get()`, …) each start a **new** pipeline invocation unless you used **`.memo()`** on that chain.

**Backoff:** between retries, the retry middleware sleeps with jitter; if the request **`signal`** aborts during that wait, the loop stops (`ERR_CANCELED`).

### Memory cache and authentication

The default cache key is ``METHOD fullUrl``. For **authenticated or per-user** GETs, also pass header names that affect the response so entries do not leak across users:

```ts
createCacheMiddleware(store, {
  ttlMs: 60_000,
  varyHeaderNames: ["authorization", "cookie"],
});
```

Or build a custom `key` and use `appendCacheKeyVaryHeaders` from the package exports. See [SECURITY.md](SECURITY.md).

### Retries and POST/PUT

By default, retries after network failures or retryable HTTP statuses run only for **GET**, **HEAD**, **OPTIONS**, and **TRACE**. To retry mutating methods, set `retry: { retryNonIdempotentMethods: true }` (per client or per request).

When `retryNonIdempotentMethods` is true and `maxAttempts > 1`, **POST** requests automatically receive a stable **`Idempotency-Key`** header (if you did not set one) so retries share the same key (Stripe-style deduplication). Opt out with `retry: { autoIdempotencyKey: false }`. You can still set `Idempotency-Key` / `idempotency-key` yourself; it will be respected.

If the request `signal` is aborted (`AbortController.abort()`), the retry middleware stops: no more `fetch` attempts, and backoff ends early when a signal is linked.

For low-level access without consuming the body in openFetch, set `rawResponse: true` on a request or use fluent `.raw()`.

### Optional URL guard (server-side)

For URLs influenced by untrusted input, call `assertSafeHttpUrl(url)` before requesting. It blocks literal private/loopback IPs for `http:`/`https:`; it does not fix DNS rebinding — see [SECURITY.md](SECURITY.md).

### Errors and logging

`OpenFetchError.toShape()` omits `config.auth` but may still include **response `data` and `headers`**. For client-facing or shared logs, use `toShape({ includeResponseData: false, includeResponseHeaders: false })`. The error instance itself can still hold full `config`; do not expose it raw.

## Documentation

- Multilingual docs (VitePress): [openfetch-js.github.io/openfetch-docs/](https://openfetch-js.github.io/openfetch-docs/)
- **Claude Code marketplace:** [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) — add with `claude plugin marketplace add openfetch-js/OpenFetch`, then `claude plugin install openfetch@openfetch-js`. Plugin bundle: [`openfetchskill/`](openfetchskill/README.md).
- **Skill structure template:** [`examples/claude-skill/`](examples/claude-skill/README.md) — minimal `SKILL.md` + `plugin.json` layout; see [`examples/README.md`](examples/README.md).
- [Project flow and file map](docs/PROJECT_FLOW.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)

Run `npm run test:security` after building to execute bundled security checks.

## Requirements

- Node.js **18** or newer (or any runtime with `fetch` and `AbortController`).

## License

MIT

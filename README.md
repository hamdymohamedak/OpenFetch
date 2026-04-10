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
| Config | `baseURL`, `params`, `headers`, `timeout`, `signal`, `data` / `body`, `auth`, `responseType`, `validateStatus` |
| Interceptors | Request and response stacks (documented call order) |
| Middleware | Async `use()` hooks wrapping the fetch adapter |
| Errors | `OpenFetchError` with `toShape()` / `toJSON()` for structured logging |
| Retry | `createRetryMiddleware()` with exponential backoff |
| Cache | `MemoryCacheStore` + `createCacheMiddleware()` (TTL, optional stale-while-revalidate) |

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

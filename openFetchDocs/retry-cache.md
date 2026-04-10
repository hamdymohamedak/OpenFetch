# Retry & memory cache

## Retry — `createRetryMiddleware`

Factory returns a **middleware** that calls `next()` repeatedly on retryable failures with **exponential backoff** and jitter.

### Resolved options (defaults + `ctx.request.retry`)

| Option | Default | Description |
|--------|---------|-------------|
| `maxAttempts` | `3` | Total tries including the first |
| `baseDelayMs` | `300` | Base delay before first retry |
| `maxDelayMs` | `30000` | Cap on delay |
| `factor` | `2` | Exponential multiplier |
| `retryOnStatus` | `[408,429,500,502,503,504]` | HTTP statuses to retry when `validateStatus` failed |
| `retryOnNetworkError` | `true` | Retry `ERR_NETWORK` / `ERR_PARSE` when rules allow |
| `retryNonIdempotentMethods` | `false` | If false, only **GET, HEAD, OPTIONS, TRACE** retry for network/parse/retryable status failures |
| `shouldRetry` | — | Optional `(error, attempt) => boolean` after built-in checks |

**Canceled requests** (`ERR_CANCELED`) are **not** retried.

### POST / PUT / side effects

By default, mutating methods are **not** retried for network or retryable HTTP errors to avoid duplicate side effects. Opt in with:

```ts
retry: { retryNonIdempotentMethods: true }
```

(per client defaults or per request).

## Memory cache — `MemoryCacheStore` + `createCacheMiddleware`

### Store

```ts
const store = new MemoryCacheStore({ maxEntries: 500 });
```

- **`maxEntries`** — When full, **oldest** entries evicted (Map insertion order). Default `500`.

### Middleware

```ts
createCacheMiddleware(store, {
  ttlMs: 60_000,
  staleWhileRevalidateMs: 0,
  methods: ["GET", "HEAD"],
  key: ({ request, url }) => `…`,
  varyHeaderNames: ["authorization", "cookie"],
});
```

Behavior:

- Only **configured methods** (default **GET**, **HEAD**).
- Skips read/write when **`memoryCache.skip`** is true on the request (also used internally for background refresh).
- **Per-request** `memoryCache.ttlMs` and `memoryCache.staleWhileRevalidateMs` override factory defaults when set.

### Cache key

Default key: ``METHOD fullUrl`` (full URL after `buildURL`).

For **authenticated or personalized** responses, include headers in the key so entries do not leak across users:

```ts
varyHeaderNames: ["authorization", "cookie"]
```

Or use a custom **`key`** and **`appendCacheKeyVaryHeaders(baseKey, headers, names)`** from the package.

### Stale-while-revalidate

If **`staleWhileRevalidateMs` > 0**, after TTL the middleware can still serve the stale entry and trigger a **background** `dispatch` with `memoryCache.skip: true` to refresh. Failures keep serving stale until `expireAt`.

## Next

- [Errors & security](./errors-security.md) for cache-related security notes and SSRF guard.

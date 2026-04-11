# Retry û cache ya bîrê

## `createRetryMiddleware`

Exponential backoff + jitter. Vebijark ji factory û `ctx.request.retry` bi awayekî sathi tên hevkirin.

| Vebijark | Standard | |
|----------|----------|--|
| `maxAttempts` | `3` | hejmara hewildanê bi yekem re |
| `baseDelayMs` | `300` | |
| `maxDelayMs` | `30000` | |
| `factor` | `2` | |
| `retryOnStatus` | 408,429,500,502,503,504 | |
| `retryOnNetworkError` | `true` | |
| `retryNonIdempotentMethods` | `false` | heke false tenê GET/HEAD/OPTIONS/TRACE |
| `shouldRetry` | — | bijartî |

`ERR_CANCELED` nayê retry kirin. Ji bo POST/PUT: `retry: { retryNonIdempotentMethods: true }`.

## `MemoryCacheStore` + `createCacheMiddleware`

```ts
const store = new MemoryCacheStore({ maxEntries: 500 });
createCacheMiddleware(store, {
  ttlMs: 60_000,
  staleWhileRevalidateMs: 0,
  methods: ["GET", "HEAD"],
  varyHeaderNames: ["authorization", "cookie"],
});
```

- Key-a standard: ``METHOD URL-tevahî``.  
- `memoryCache.skip` dixwîne/nivîsîne derbas nake.  
- `ttlMs` / `staleWhileRevalidateMs` ji bo her daxwazê.  
- **SWR:** piştî TTL hîn jî dikare bersiva kevn bide û di paşperdeyê de `dispatch` bike.

## Pêş

- [Çewtî û ewlehî](./errors-security.md)

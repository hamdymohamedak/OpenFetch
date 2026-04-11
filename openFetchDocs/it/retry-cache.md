# Retry e cache in memoria

## `createRetryMiddleware`

Backoff esponenziale + jitter. Opzioni da default + `ctx.request.retry`.

| Opzione | Default | |
|---------|---------|--|
| `maxAttempts` | `3` | |
| `baseDelayMs` | `300` | |
| `maxDelayMs` | `30000` | |
| `factor` | `2` | |
| `retryOnStatus` | 408,429,500,502,503,504 | |
| `retryOnNetworkError` | `true` | |
| `retryNonIdempotentMethods` | `false` | Solo GET/HEAD/OPTIONS/TRACE salvo `true` |
| `shouldRetry` | — | |

`ERR_CANCELED`: nessun retry. Per POST/PUT: `retry: { retryNonIdempotentMethods: true }`.

## Cache

```ts
const store = new MemoryCacheStore({ maxEntries: 500 });
createCacheMiddleware(store, {
  ttlMs: 60_000,
  varyHeaderNames: ["authorization", "cookie"],
});
```

Chiave default: ``METHOD urlCompleta``. `memoryCache.skip` per bypass/SWR in background.

## Prossimo

- [Errori e sicurezza](./errors-security.md)

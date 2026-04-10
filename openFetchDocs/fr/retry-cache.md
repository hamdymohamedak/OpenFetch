# Nouvelles tentatives et cache mémoire

## `createRetryMiddleware`

Backoff exponentiel + jitter. Options fusionnées depuis les defaults et `ctx.request.retry`.

| Option | Défaut | Rôle |
|--------|--------|------|
| `maxAttempts` | `3` | |
| `baseDelayMs` | `300` | |
| `maxDelayMs` | `30000` | |
| `factor` | `2` | |
| `retryOnStatus` | 408,429,5xx listés | |
| `retryOnNetworkError` | `true` | |
| `retryNonIdempotentMethods` | `false` | Si false, retry réseau/parse/statuts seulement pour **GET, HEAD, OPTIONS, TRACE** |
| `shouldRetry` | — | Callback optionnelle |

`ERR_CANCELED` : pas de retry.

Pour autoriser POST/PUT etc. : `retry: { retryNonIdempotentMethods: true }`.

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

- Clé par défaut : ``METHOD urlComplète``.  
- `memoryCache.skip` bypass ; utilisé en arrière-plan pour SWR.  
- **`varyHeaderNames`** ou **`key`** pour ne pas mélanger les utilisateurs.

**SWR :** après TTL, sert périmé et rafraîchit en tâche de fond si `staleWhileRevalidateMs > 0`.

## Suite

- [Erreurs et sécurité](./errors-security.md)

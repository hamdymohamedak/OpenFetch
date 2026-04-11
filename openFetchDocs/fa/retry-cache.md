# تلاش مجدد و حافظهٔ نهان

## `createRetryMiddleware`

عقب‌نشینی نمایی + جیتر. گزینه‌ها از پیش‌فرض کارخانه و `ctx.request.retry` به‌صورت سطحی ادغام می‌شوند.

| گزینه | پیش‌فرض | |
|--------|---------|--|
| `maxAttempts` | `3` | شامل اولین تلاش |
| `baseDelayMs` | `300` | |
| `maxDelayMs` | `30000` | |
| `factor` | `2` | |
| `retryOnStatus` | 408,429,500,502,503,504 | |
| `retryOnNetworkError` | `true` | |
| `retryNonIdempotentMethods` | `false` | در false فقط GET/HEAD/OPTIONS/TRACE |
| `shouldRetry` | — | اختیاری |

`ERR_CANCELED` دوباره امتحان نمی‌شود. برای POST و غیره: `retry: { retryNonIdempotentMethods: true }`.

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

- کلید پیش‌فرض: ``METHOD urlکامل``.  
- `memoryCache.skip` خواندن/نوشتن را رد می‌کند.  
- `ttlMs` / `staleWhileRevalidateMs` در هر درخواست.  
- **SWR:** پس از TTL با `staleWhileRevalidateMs` پاسخ کهنه پس‌زمینه با `dispatch` تازه می‌شود.

## بعدی

- [خطا و امنیت](./errors-security.md)

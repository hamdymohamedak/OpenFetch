# रीट्राई और मेमोरी कैश

## `createRetryMiddleware`

घातांकी बैकऑफ़ + जिटर। विकल्प: फ़ैक्टरी डिफ़ॉल्ट + `ctx.request.retry` का उथला मर्ज।

| विकल्प | डिफ़ॉल्ट | |
|--------|----------|--|
| `maxAttempts` | `3` | कुल प्रयास |
| `baseDelayMs` | `300` | |
| `maxDelayMs` | `30000` | |
| `factor` | `2` | |
| `retryOnStatus` | 408,429,500,502,503,504 | |
| `retryOnNetworkError` | `true` | |
| `retryNonIdempotentMethods` | `false` | `false` होने पर GET/HEAD/OPTIONS/TRACE ही |
| `shouldRetry` | — | वैकल्पिक कस्टम गेट |

`ERR_CANCELED` पर रीट्राई नहीं। POST/PUT आदि के लिए: `retry: { retryNonIdempotentMethods: true }`।

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

- डिफ़ॉल्ट कुंजी: ``METHOD पूर्णURL``।  
- `memoryCache.skip` पढ़ना/लिखना छोड़ता है।  
- प्रति-अनुरोध `ttlMs` / `staleWhileRevalidateMs`।  
- **Stale-while-revalidate:** TTL के बाद पुराना जवाब देकर पृष्ठभूमि में `dispatch`।

## आगे

- [त्रुटियाँ और सुरक्षा](./errors-security.md)

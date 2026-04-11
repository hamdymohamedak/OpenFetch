# 재시도와 메모리 캐시

## `createRetryMiddleware`

지수 백오프 + 지터. 팩토리 기본값과 `ctx.request.retry` 를 얕게 병합.

| 옵션 | 기본값 | |
|------|--------|--|
| `maxAttempts` | `3` | 첫 시도 포함 총 횟수 |
| `baseDelayMs` | `300` | |
| `maxDelayMs` | `30000` | |
| `factor` | `2` | |
| `retryOnStatus` | 408,429,500,502,503,504 | |
| `retryOnNetworkError` | `true` | |
| `retryNonIdempotentMethods` | `false` | false 면 해당 실패에 대해 GET/HEAD/OPTIONS/TRACE 만 재시도 |
| `shouldRetry` | — | 선택 |

`ERR_CANCELED` 는 재시도 안 함. POST 등도 재시도하려면 `retry: { retryNonIdempotentMethods: true }`.

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

- 기본 키: ``METHOD 전체URL``.  
- `memoryCache.skip` 로 읽기/쓰기 생략.  
- 요청별 `ttlMs` / `staleWhileRevalidateMs`.  
- **SWR:** TTL 이후에도 `staleWhileRevalidateMs` 동안은 오래된 값을 주고 백그라운드에서 `dispatch`.

## 다음

- [오류와 보안](./errors-security.md)

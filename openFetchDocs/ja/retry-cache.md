# リトライとインメモリキャッシュ

## `createRetryMiddleware`

指数バックオフ + ジッター。オプションはファクトリ既定と `ctx.request.retry` の浅いマージ。

| オプション | 既定 | |
|------------|------|--|
| `maxAttempts` | `3` | 初回含む試行回数 |
| `baseDelayMs` | `300` | |
| `maxDelayMs` | `30000` | |
| `factor` | `2` | |
| `retryOnStatus` | 408,429,500,502,503,504 | |
| `retryOnNetworkError` | `true` | |
| `retryNonIdempotentMethods` | `false` | false 時は GET/HEAD/OPTIONS/TRACE のみ該当ケースでリトライ |
| `shouldRetry` | — | 任意 |

`ERR_CANCELED` はリトライしません。POST 等もリトライする場合は `retry: { retryNonIdempotentMethods: true }`。

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

- 既定キー: ``METHOD 完全URL``。  
- `memoryCache.skip` で読み書きスキップ（バックグラウンド更新でも使用）。  
- リクエストごとの `ttlMs` / `staleWhileRevalidateMs` で上書き。  
- **SWR:** TTL 経過後も `staleWhileRevalidateMs` 内は古い値を返しつつバックグラウンドで `dispatch`。

## 次へ

- [エラーとセキュリティ](./errors-security.md)

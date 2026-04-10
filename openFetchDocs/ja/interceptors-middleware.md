# インターセプターとミドルウェア

## ライフサイクル（概要）

1. 設定のマージ  
2. **リクエスト** インターセプター  
3. `OpenFetchContext`  
4. **ミドルウェア** → 内側で `dispatch`（`fetch`）  
5. **レスポンス** インターセプター  
6. 完全なレスポンス、または `unwrapResponse` 時は `data` のみ

## インターセプター

```ts
client.interceptors.request.use(fulfilled?, rejected?);
client.interceptors.response.use(fulfilled?, rejected?);
```

- **リクエスト:** **後から登録したものが先**（LIFO）。  
- **レスポンス:** **登録順**（FIFO）。

## ミドルウェア

`client.use(fn)` は `defaults.middlewares` に **push** します。**順序は重要**（キャッシュとリトライの前後）。

## 同梱ファクトリ

`createRetryMiddleware`、`createCacheMiddleware` — [リトライとキャッシュ](./retry-cache.md)。

## 次へ

- [リトライとキャッシュ](./retry-cache.md)  
- [エラーとセキュリティ](./errors-security.md)

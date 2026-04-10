# openFetch — 日本語 (ja)

**@hamdymohamedak/openfetch** は、標準の [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) を備えた JavaScript ランタイム向けの、依存ゼロの小さな HTTP クライアントです。デフォルト付きインスタンス、リクエスト／レスポンス **インターセプター**、合成可能な **ミドルウェア**、指数バックオフ付き **リトライ**、GET/HEAD 向け **インメモリキャッシュ**、構造化 **エラー**、信頼できない URL 用の任意 **URL ガード** を提供し、React や `window`、レガシー XHR には依存しません。

## 設計目標

- **トランスポートは `fetch` のみ**（Node 18+、Bun、Deno、Workers、ブラウザ）。
- 対象環境では **必須 polyfill なし**。
- **サーバー向け:** SSR や React Server Components に適する。

## ドキュメント

1. [はじめに](./getting-started.md)  
2. [設定](./configuration.md)  
3. [インターセプターとミドルウェア](./interceptors-middleware.md)  
4. [リトライとキャッシュ](./retry-cache.md)  
5. [エラーとセキュリティ](./errors-security.md)  

## 公開 API（要約）

| エクスポート | 役割 |
|--------------|------|
| **default** | `createClient()` 済みインスタンス |
| `createClient` / `create` | 新しいクライアント |
| `OpenFetchError`, `isOpenFetchError` | 型付きエラー |
| `InterceptorManager` | インターセプタースタック |
| `createRetryMiddleware` | リトライ用ミドルウェア |
| `MemoryCacheStore`, `createCacheMiddleware`, `appendCacheKeyVaryHeaders` | メモリキャッシュ |
| 型 | `OpenFetchConfig`, `OpenFetchResponse` など |
| `assertSafeHttpUrl` | 任意の SSRF 対策（リテラル IP / localhost） |

## 要件

**Node.js 18 以上**、または `fetch` と `AbortController` があるランタイム。

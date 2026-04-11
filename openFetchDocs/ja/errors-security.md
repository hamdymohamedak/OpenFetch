# エラーとセキュリティ

## `OpenFetchError`

`code`, `config?`, `response?`, `request?`。よく使う `code`: `ERR_BAD_RESPONSE`, `ERR_NETWORK`, `ERR_PARSE`, `ERR_CANCELED`。

## `isOpenFetchError`

型ガード。

## `toShape()` / `toJSON()`

シリアライズ形状からは `config.auth` を除外。インスタンス自体は機密を含み得るため、生でクライアントに渡さないでください。

```ts
error.toShape({
  includeResponseData: false,
  includeResponseHeaders: false,
});
```

## `assertSafeHttpUrl(url)`

サーバー側の任意ガード。`http:`/`https:` のみ。localhost とリテラルのプライベート／ループバック IP を拒否。**DNS リバインディングは防げません。**

## キャッシュと認証

[リトライとキャッシュ](./retry-cache.md) の `varyHeaderNames` またはカスタム `key`。

## 参照

パッケージの `SECURITY.md`、`npm run test:security`。

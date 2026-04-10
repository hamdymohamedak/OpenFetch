# はじめに

## インストール

```bash
npm install @hamdymohamedak/openfetch
```

**ESM のみ**です。`"@hamdymohamedak/openfetch"` から import します。

## デフォルトインスタンス

```ts
import openFetch from "@hamdymohamedak/openfetch";

const res = await openFetch.get("https://api.example.com/v1/users");
```

## `createClient` / `create`

```ts
import { createClient } from "@hamdymohamedak/openfetch";

const api = createClient({
  baseURL: "https://api.example.com",
  headers: { Authorization: "Bearer <token>" },
  timeout: 10_000,
  unwrapResponse: true,
});

const users = await api.get("/v1/users");
```

## HTTP メソッド

`unwrapResponse` が無い場合は `Promise<OpenFetchResponse<T>>`、ある場合は `Promise<T>` です。

| メソッド | 備考 |
|----------|------|
| `request(urlOrConfig, config?)` | |
| `get`, `head`, `options` | |
| `post`, `put`, `patch` | プレーンオブジェクトは JSON + 未設定時 `content-type` |
| `delete` | |

**`url` は必須:** マージ後に無いと ``openfetch: `url` is required`` になります。

## ミドルウェア

```ts
import { createClient, createRetryMiddleware } from "@hamdymohamedak/openfetch";

const client = createClient({ middlewares: [createRetryMiddleware()] });
client.use(createRetryMiddleware({ maxAttempts: 5 }));
```

## 次へ

- [設定](./configuration.md)

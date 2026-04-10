# شروع سریع

## نصب

```bash
npm install @hamdymohamedak/openfetch
```

بسته **فقط ESM** است. از `"@hamdymohamedak/openfetch"` وارد کنید.

## نمونهٔ پیش‌فرض

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

## متدهای HTTP

بدون `unwrapResponse`: `Promise<OpenFetchResponse<T>>`؛ با آن: `Promise<T>`.

| متد | یادداشت |
|-----|---------|
| `request(urlOrConfig, config?)` | |
| `get`, `head`, `options` | |
| `post`, `put`, `patch` | اشیای ساده → JSON + `content-type` در نبود CT |
| `delete` | |

**URL الزامی است:** در غیر این صورت ``openfetch: `url` is required``.

## میان‌افزار

```ts
import { createClient, createRetryMiddleware } from "@hamdymohamedak/openfetch";

const client = createClient({ middlewares: [createRetryMiddleware()] });
client.use(createRetryMiddleware({ maxAttempts: 5 }));
```

## بعدی

- [پیکربندی](./configuration.md)

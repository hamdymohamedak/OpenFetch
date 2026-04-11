# Getting started

## Installation

Package on npm: [**@hamdymohamedak/openfetch**](https://www.npmjs.com/package/@hamdymohamedak/openfetch). Source repo: [**openfetch-js/OpenFetch**](https://github.com/openfetch-js/OpenFetch) on GitHub.

```bash
npm install @hamdymohamedak/openfetch
```

The package is ESM-only (`"type": "module"`). Import from `"@hamdymohamedak/openfetch"`.

## Default instance

The default export is a client created with `createClient()` and no initial defaults:

```ts
import openFetch from "@hamdymohamedak/openfetch";

const res = await openFetch.get("https://api.example.com/v1/users");
// res is OpenFetchResponse: { data, status, statusText, headers, config }
```

## Named client with `createClient` / `create`

`createClient` and `create` are aliases. Pass **initial defaults**; you can still mutate `client.defaults` later.

```ts
import { createClient } from "@hamdymohamedak/openfetch";

const api = createClient({
  baseURL: "https://api.example.com",
  headers: { Authorization: "Bearer <token>" },
  timeout: 10_000,
  unwrapResponse: true,
});

const users = await api.get("/v1/users");
// With unwrapResponse: true, users is the parsed body only (T), not OpenFetchResponse
```

## HTTP helpers (overview)

Each method returns `Promise<OpenFetchResponse<T>>` unless `unwrapResponse` is true, then `Promise<T>`.

| Method | Notes |
|--------|--------|
| `request(urlOrConfig, config?)` | `url` string/URL or full config object |
| `get`, `head`, `options` | URL + optional config |
| `post`, `put`, `patch` | URL, optional `data`, optional config — plain objects get JSON body + `content-type` when no CT set |
| `delete` | URL + optional config |

**URL required:** If the merged config has no `url`, the client throws: ``openfetch: `url` is required``.

For method-by-method examples (query params, JSON, `FormData`, `unwrapResponse`), see [HTTP methods](./http-methods.md).

## Registering middleware

```ts
import { createClient, createRetryMiddleware } from "@hamdymohamedak/openfetch";

const client = createClient({
  middlewares: [createRetryMiddleware()],
});
// or later:
client.use(createRetryMiddleware({ maxAttempts: 5 }));
```

See [Interceptors & middleware](./interceptors-middleware.md) and [Retry & cache](./retry-cache.md).

## Next

- [HTTP methods](./http-methods.md) — detailed syntax for every verb  
- [React & Vue](./framework-guides.md) — framework integration patterns  
- [Configuration](./configuration.md) for every request option and response details.

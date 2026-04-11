# Destpêk

## Sazkirin

```bash
npm install @hamdymohamedak/openfetch
```

Pakêt **tenê ESM** ye. Ji `"@hamdymohamedak/openfetch"` import bike.

## Instance ya standard

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

## Metodên HTTP

Bê `unwrapResponse`: `Promise<OpenFetchResponse<T>>`; bi wê: `Promise<T>`.

| Metod | Not |
|-------|-----|
| `request(urlOrConfig, config?)` | |
| `get`, `head`, `options` | |
| `post`, `put`, `patch` | objeyên sade → JSON + `content-type` heke tune be |
| `delete` | |

**URL pêwîst e:** heke di config-a hevgirtî de tune be → ``openfetch: `url` is required``.

## Middleware

```ts
import { createClient, createRetryMiddleware } from "@hamdymohamedak/openfetch";

const client = createClient({ middlewares: [createRetryMiddleware()] });
client.use(createRetryMiddleware({ maxAttempts: 5 }));
```

## Pêş

- [Veavakirin](./configuration.md)

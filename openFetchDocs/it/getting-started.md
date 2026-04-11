# Introduzione

## Installazione

```bash
npm install @hamdymohamedak/openfetch
```

Solo **ESM**. Import: `"@hamdymohamedak/openfetch"`.

## Istanza predefinita

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

## Metodi HTTP

`Promise<OpenFetchResponse<T>>` oppure `Promise<T>` con `unwrapResponse: true`.

| Metodo | Note |
|--------|------|
| `request(urlOrConfig, config?)` | |
| `get`, `head`, `options` | |
| `post`, `put`, `patch` | oggetti semplici → JSON + `content-type` se mancante |
| `delete` | |

**URL obbligatoria:** altrimenti ``openfetch: `url` is required``.

## Middleware

```ts
import { createClient, createRetryMiddleware } from "@hamdymohamedak/openfetch";

const client = createClient({ middlewares: [createRetryMiddleware()] });
client.use(createRetryMiddleware({ maxAttempts: 5 }));
```

## Prossimo

- [Configurazione](./configuration.md)

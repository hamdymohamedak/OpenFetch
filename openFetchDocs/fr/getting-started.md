# Démarrage

## Installation

```bash
npm install @hamdymohamedak/openfetch
```

Paquet **ESM uniquement**. Import : `"@hamdymohamedak/openfetch"`.

## Instance par défaut

```ts
import openFetch from "@hamdymohamedak/openfetch";

const res = await openFetch.get("https://api.example.com/v1/users");
```

## `createClient` / `create`

Alias. Passez des **defaults** initiaux ; `client.defaults` reste modifiable.

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

## Méthodes HTTP

Retour `Promise<OpenFetchResponse<T>>` sauf si `unwrapResponse` → `Promise<T>`.

| Méthode | Notes |
|---------|--------|
| `request(urlOrConfig, config?)` | URL ou config complète |
| `get`, `head`, `options` | URL + config optionnelle |
| `post`, `put`, `patch` | URL, `data` optionnel — objets → JSON + `content-type` si absent |
| `delete` | URL + config |

**URL requise :** sinon erreur ``openfetch: `url` is required``.

## Middleware

```ts
import { createClient, createRetryMiddleware } from "@hamdymohamedak/openfetch";

const client = createClient({ middlewares: [createRetryMiddleware()] });
client.use(createRetryMiddleware({ maxAttempts: 5 }));
```

Voir [Intercepteurs et middleware](./interceptors-middleware.md) et [Nouvelles tentatives et cache](./retry-cache.md).

## Suite

- [Configuration](./configuration.md)

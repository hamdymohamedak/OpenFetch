# Primeros pasos

## Instalación

```bash
npm install @hamdymohamedak/openfetch
```

El paquete es solo ESM (`"type": "module"`). Importa desde `"@hamdymohamedak/openfetch"`.

## Instancia por defecto

La exportación por defecto es un cliente creado con `createClient()` sin valores iniciales:

```ts
import openFetch from "@hamdymohamedak/openfetch";

const res = await openFetch.get("https://api.example.com/v1/users");
// res es OpenFetchResponse: { data, status, statusText, headers, config }
```

## Cliente con nombre: `createClient` / `create`

`createClient` y `create` son alias. Pasa **valores por defecto iniciales**; puedes mutar `client.defaults` después.

```ts
import { createClient } from "@hamdymohamedak/openfetch";

const api = createClient({
  baseURL: "https://api.example.com",
  headers: { Authorization: "Bearer <token>" },
  timeout: 10_000,
  unwrapResponse: true,
});

const users = await api.get("/v1/users");
// Con unwrapResponse: true, users es solo el cuerpo parseado (T)
```

## Métodos HTTP

Cada método devuelve `Promise<OpenFetchResponse<T>>` salvo si `unwrapResponse` es true → `Promise<T>`.

| Método | Notas |
|--------|--------|
| `request(urlOrConfig, config?)` | URL como string/URL o objeto de configuración completo |
| `get`, `head`, `options` | URL + config opcional |
| `post`, `put`, `patch` | URL, `data` opcional, config opcional — objetos planos → cuerpo JSON + `content-type` si no hay CT |
| `delete` | URL + config opcional |

**URL obligatoria:** si la config fusionada no tiene `url`, el cliente lanza: ``openfetch: `url` is required``.

## Registrar middleware

```ts
import { createClient, createRetryMiddleware } from "@hamdymohamedak/openfetch";

const client = createClient({
  middlewares: [createRetryMiddleware()],
});
// o después:
client.use(createRetryMiddleware({ maxAttempts: 5 }));
```

Ver [Interceptores y middleware](./interceptors-middleware.md) y [Reintentos y caché](./retry-cache.md).

## Siguiente

- [Configuración](./configuration.md)

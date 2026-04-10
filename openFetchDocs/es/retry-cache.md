# Reintentos y caché en memoria

## Reintentos — `createRetryMiddleware`

Devuelve un **middleware** que vuelve a llamar a `next()` en fallos reintentables con **retroceso exponencial** y jitter.

### Opciones (defaults + `ctx.request.retry`)

| Opción | Defecto | Descripción |
|--------|---------|-------------|
| `maxAttempts` | `3` | Intentos totales incluido el primero |
| `baseDelayMs` | `300` | Retraso base antes del primer reintento |
| `maxDelayMs` | `30000` | Tope del retraso |
| `factor` | `2` | Multiplicador exponencial |
| `retryOnStatus` | `[408,429,500,502,503,504]` | Códigos HTTP cuando falla `validateStatus` |
| `retryOnNetworkError` | `true` | Reintentar `ERR_NETWORK` / `ERR_PARSE` si aplica |
| `retryNonIdempotentMethods` | `false` | Si es false, solo **GET, HEAD, OPTIONS, TRACE** para esos fallos |
| `shouldRetry` | — | `(error, attempt) => boolean` opcional tras reglas internas |

**Cancelación** (`ERR_CANCELED`): **no** se reintenta.

### POST / PUT / efectos secundarios

Por defecto los métodos mutadores **no** se reintentan. Activa con:

```ts
retry: { retryNonIdempotentMethods: true }
```

## Caché — `MemoryCacheStore` + `createCacheMiddleware`

### Almacén

```ts
const store = new MemoryCacheStore({ maxEntries: 500 });
```

- **`maxEntries`** — Al llenarse, se expulsan las entradas **más antiguas**. Por defecto `500`.

### Middleware

```ts
createCacheMiddleware(store, {
  ttlMs: 60_000,
  staleWhileRevalidateMs: 0,
  methods: ["GET", "HEAD"],
  key: ({ request, url }) => `…`,
  varyHeaderNames: ["authorization", "cookie"],
});
```

- Solo métodos configurados (por defecto **GET**, **HEAD**).
- Omite lectura/escritura con **`memoryCache.skip`**.
- **`memoryCache.ttlMs`** y **`staleWhileRevalidateMs`** por petición sustituyen los defaults del factory.

### Clave de caché

Por defecto: ``METHOD urlCompleta``.

Para respuestas **autenticadas o personalizadas**:

```ts
varyHeaderNames: ["authorization", "cookie"]
```

O **`key`** personalizada + **`appendCacheKeyVaryHeaders`**.

### Stale-while-revalidate

Si **`staleWhileRevalidateMs` > 0**, tras el TTL puede servir entrada obsoleta y lanzar **`dispatch` en segundo plano** con `memoryCache.skip: true`. Si falla la actualización, sigue sirviendo hasta `expireAt`.

## Siguiente

- [Errores y seguridad](./errors-security.md)

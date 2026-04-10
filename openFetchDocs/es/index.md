# openFetch — Español (es)

**@hamdymohamedak/openfetch** es un cliente HTTP pequeño y sin dependencias para cualquier runtime de JavaScript que exponga [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). Añade instancias con valores por defecto, **interceptores** de petición/respuesta, **middleware** componible, **reintentos** opcionales con retroceso exponencial, **caché en memoria** para GET/HEAD, **errores** estructurados y una **protección de URL** opcional para URLs no confiables — sin acoplar a React, `window` ni XHR heredado.

## Objetivos de diseño

- **Un solo transporte:** solo `fetch` (Node 18+, Bun, Deno, Workers, navegadores).
- **Sin polyfills obligatorios** en entornos soportados.
- **Seguro en servidor:** adecuado para SSR y React Server Components.

## Páginas

1. [Primeros pasos](./getting-started.md) — instalación, exportación por defecto, `createClient`, primeras peticiones  
2. [Configuración](./configuration.md) — opciones de petición, forma de la respuesta, `unwrapResponse`  
3. [Interceptores y middleware](./interceptors-middleware.md) — orden de ejecución, `use()`, middleware propio  
4. [Reintentos y caché](./retry-cache.md) — `createRetryMiddleware`, `createCacheMiddleware`, TTL / SWR  
5. [Errores y seguridad](./errors-security.md) — `OpenFetchError`, códigos, registro seguro, `assertSafeHttpUrl`  

## API pública (resumen)

| Exportación | Función |
|-------------|---------|
| **default** | Instancia ya creada con `createClient()` |
| `createClient` / `create` | Nuevo cliente con `initialDefaults` opcionales |
| `OpenFetchError`, `isOpenFetchError` | Errores tipados y comprobación de tipo |
| `InterceptorManager` | Pila de interceptores (normalmente vía `client.interceptors`) |
| `createRetryMiddleware` | Fábrica de middleware de reintentos |
| `MemoryCacheStore`, `createCacheMiddleware`, `appendCacheKeyVaryHeaders` | Caché en memoria |
| Tipos | `OpenFetchConfig`, `OpenFetchResponse`, `Middleware`, `OpenFetchClient`, etc. |
| `assertSafeHttpUrl` | Protección opcional SSRF para IPs literales / localhost |

## Requisitos

**Node.js 18+** o cualquier runtime con `fetch` y `AbortController`.

# openFetch — Italiano (it)

**@hamdymohamedak/openfetch** è un client HTTP leggero senza dipendenze per qualsiasi runtime JavaScript con [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). Offre istanze con default, **intercettori** richiesta/risposta, **middleware** componibili, **retry** con backoff esponenziale, **cache in memoria** per GET/HEAD, **errori** strutturati e un **controllo URL** opzionale — senza legarsi a React, `window` o XHR legacy.

## Obiettivi

- **Solo `fetch`** (Node 18+, Bun, Deno, Workers, browser).
- **Nessun polyfill obbligatorio.**
- **Adatto al server:** SSR e React Server Components.

## Pagine

1. [Introduzione](./getting-started.md)  
2. [Configurazione](./configuration.md)  
3. [Intercettori e middleware](./interceptors-middleware.md)  
4. [Retry e cache](./retry-cache.md)  
5. [Errori e sicurezza](./errors-security.md)  

## API pubblica (sintesi)

| Esportazione | Ruolo |
|--------------|--------|
| **default** | Istanza `createClient()` |
| `createClient` / `create` | Nuovo client |
| `OpenFetchError`, `isOpenFetchError` | Errori tipizzati |
| `InterceptorManager` | Pila intercettori |
| `createRetryMiddleware` | Factory retry |
| `MemoryCacheStore`, `createCacheMiddleware`, `appendCacheKeyVaryHeaders` | Cache |
| Tipi | `OpenFetchConfig`, `OpenFetchResponse`, … |
| `assertSafeHttpUrl` | Guardia SSRF opzionale |

## Requisiti

**Node.js 18+** o runtime con `fetch` e `AbortController`.

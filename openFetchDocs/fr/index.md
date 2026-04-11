# openFetch — Français (fr)

**@hamdymohamedak/openfetch** est un client HTTP minimal sans dépendances pour tout runtime JavaScript exposant [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). Il ajoute des instances avec valeurs par défaut, des **intercepteurs** requête/réponse, du **middleware** composable, des **nouvelles tentatives** avec backoff exponentiel, un **cache mémoire** pour GET/HEAD, des **erreurs** structurées et une **garde d’URL** optionnelle — sans couplage à React, `window` ou XHR.

## Objectifs

- **Un seul transport :** `fetch` uniquement (Node 18+, Bun, Deno, Workers, navigateurs).
- **Pas de polyfills obligatoires.**
- **Compatible serveur :** SSR et React Server Components.

## Pages

1. [Démarrage](./getting-started.md)  
2. [Configuration](./configuration.md)  
3. [Intercepteurs et middleware](./interceptors-middleware.md)  
4. [Nouvelles tentatives et cache](./retry-cache.md)  
5. [Erreurs et sécurité](./errors-security.md)  

## API publique (résumé)

| Export | Rôle |
|--------|------|
| **default** | Instance `createClient()` |
| `createClient` / `create` | Nouveau client |
| `OpenFetchError`, `isOpenFetchError` | Erreurs typées |
| `InterceptorManager` | Pile d’intercepteurs |
| `createRetryMiddleware` | Middleware de retry |
| `MemoryCacheStore`, `createCacheMiddleware`, `appendCacheKeyVaryHeaders` | Cache mémoire |
| Types | `OpenFetchConfig`, `OpenFetchResponse`, etc. |
| `assertSafeHttpUrl` | Garde optionnelle SSRF (IP littérales / localhost) |

## Prérequis

**Node.js 18+** ou runtime avec `fetch` et `AbortController`.

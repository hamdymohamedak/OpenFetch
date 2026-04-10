# openFetch — Kurdî (ku)

**@hamdymohamedak/openfetch** klientekî HTTP-yê piçûk e, bê dependency, ji bo her runtime-ekî JavaScript ku [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) standard hebe. Instance bi default, **interceptors** (daxwaz/welat), **middleware**-yên komkirî, **retry** bi exponential backoff, **cache** ya bîrê ji bo GET/HEAD, **errors**-ên strukturkirî û **parastina URL**-ya bijartî pêşkêş dike — bê girêdan bi React, `window` an XHR-ên kevn.

## Armancên sêwiranê

- **Tenê `fetch`** (Node 18+, Bun, Deno, Workers, gerok).
- **Ne hewce polyfill** li derdorên piştgirîkirî.
- **Ba server re:** SSR û React Server Components.

## Rûpel

1. [Destpêk](./getting-started.md)  
2. [Veavakirin](./configuration.md)  
3. [Interceptors û middleware](./interceptors-middleware.md)  
4. [Retry û cache](./retry-cache.md)  
5. [Çewtî û ewlehî](./errors-security.md)  

## API ya gelemperî (kurte)

| Export | Rol |
|--------|-----|
| **default** | Instance berê bi `createClient()` hatiye çêkirin |
| `createClient` / `create` | Klientê nû |
| `OpenFetchError`, `isOpenFetchError` | Çewtiyên bi cure |
| `InterceptorManager` | Stack-a interceptors |
| `createRetryMiddleware` | Factory ji bo retry middleware |
| `MemoryCacheStore`, `createCacheMiddleware`, `appendCacheKeyVaryHeaders` | Cache ya bîrê |
| Types | `OpenFetchConfig`, `OpenFetchResponse`, hwd. |
| `assertSafeHttpUrl` | Parastina bijartî (SSRF-wekî ji bo IP literal / localhost) |

## Pêdivî

**Node.js 18+** an runtime bi `fetch` û `AbortController`.

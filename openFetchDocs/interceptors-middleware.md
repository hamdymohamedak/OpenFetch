# Interceptors & middleware

## Request lifecycle (short)

1. Merge **defaults** + call config.  
2. Run **request interceptors** on the config.  
3. Build **`OpenFetchContext`** (`url`, `request`, `response`, `error`).  
4. Run **middleware** stack; innermost calls **`dispatch`** (`fetch` + parse + validate + response transforms).  
5. Run **response interceptors** on the successful response.  
6. Return full response or `data` if `unwrapResponse`.

See the package’s `docs/PROJECT_FLOW.md` for a diagram and file map.

## Interceptors

Each client exposes:

```ts
client.interceptors.request.use(fulfilled?, rejected?);
client.interceptors.response.use(fulfilled?, rejected?);
```

**Order:**

- **Request:** handlers run **last registered first** (LIFO).
- **Response:** handlers run **first registered first** (FIFO).

Handlers return the value or a Promise. `rejected` follows standard promise chaining semantics.

## Middleware

Type:

```ts
type Middleware = (
  ctx: OpenFetchContext,
  next: NextFn
) => Promise<void>;
```

- **`ctx.request`** — Final merged config for this round trip.  
- **`ctx.response`** — Set by `dispatch` (or a middleware) on success.  
- **`ctx.error`** — Set on failure; the client rethrows if there is still no `response` after the stack.

Register on the client:

```ts
client.use(async (ctx, next) => {
  console.log("before", ctx.request.method);
  await next();
  console.log("after", ctx.response?.status);
});
```

`client.use` **pushes** onto `defaults.middlewares`.

### Ordering

Outer middleware runs first when entering the stack. **Order matters** for cache vs retry: e.g. cache **before** retry avoids retrying on cache hits; retry **before** cache retries origin failures before a cache layer sees them. Choose based on product rules.

## Built-in middleware factories

- **`createRetryMiddleware(options?)`** — See [Retry & cache](./retry-cache.md).  
- **`createCacheMiddleware(store, options?)`** — See [Retry & cache](./retry-cache.md).

## Next

- [Retry & cache](./retry-cache.md)  
- [Errors & security](./errors-security.md)

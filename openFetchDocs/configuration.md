# Configuration

Configuration is merged from **client defaults** and **per-call** options via `mergeConfig` (see merge rules below).

## `OpenFetchConfig` (request)

### URL and query

- **`url`** — Absolute or relative (with `baseURL`).
- **`baseURL`** — Prepended to non-absolute paths (see URL helpers in the package: `buildURL`, `combineURLs`, `isAbsoluteURL`).
- **`params`** — Plain object serialized to a query string (default serializer; override with **`paramsSerializer`**).

### Method and body

- **`method`** — HTTP method; helpers set this automatically.
- **`data`** — Logical payload: after **`transformRequest`** hooks, objects (except `FormData`, `URLSearchParams`, `Blob`, `ArrayBuffer`, typed arrays) are JSON-stringified; `content-type` defaults to `application/json` if missing.
- **`body`** — Raw `fetch` body when you do not use `data` the same way; dispatch uses `data` if defined, else `body`.

### Headers and auth

- **`headers`** — `Record<string, string>` (normalized to lowercase keys internally for the outgoing request).
- **`auth`** — `{ username, password }` → `Authorization: Basic …`.
- **`withCredentials: true`** — Sets `credentials: 'include'` unless **`credentials`** is set explicitly.

### Timeouts and cancellation

- **`timeout`** — Milliseconds; uses an internal `AbortController` merged with **`signal`** via `mergeAbortSignals`.
- **`signal`** — External `AbortSignal`; combined with timeout abort.

### Response handling

- **`responseType`** — `"json"` | `"text"` | `"arraybuffer"` | `"blob"` | `"stream"`.  
  If omitted, dispatch infers JSON from `Content-Type: application/json`, otherwise reads as text.
- **`validateStatus`** — `(status: number) => boolean`. Default: 200–299 inclusive. If false, throws **`OpenFetchError`** with code `ERR_BAD_RESPONSE` and attaches the response.

### Transforms

- **`transformRequest`** — Array of `(data, headers) => unknown`. Run in order before building the fetch body.
- **`transformResponse`** — Array of `(data) => T`. Run on successful responses after parsing.

### Middleware, retry, cache hints

- **`middlewares`** — Array of middleware functions (concatenated with defaults).
- **`retry`** — Shallow-merged retry options for `createRetryMiddleware` (defaults + per request).
- **`memoryCache`** — Per-request overrides for cache middleware: `ttlMs`, `staleWhileRevalidateMs`, `skip`.

### Ergonomics

- **`unwrapResponse`** — When `true`, `get`/`post`/… return **`data` only** instead of full `OpenFetchResponse`. Useful for RSC and minimal call sites.

### `RequestInit` passthrough

These `RequestInit` fields are typed on `OpenFetchConfig` and passed to `fetch`:

`cache`, `credentials`, `integrity`, `keepalive`, `mode`, `redirect`, `referrer`, `referrerPolicy`.

## `OpenFetchResponse`

```ts
type OpenFetchResponse<T = unknown> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: OpenFetchConfig;
};
```

## Merge behavior (`mergeConfig`)

- Top-level keys: later config wins.
- **`headers`**: shallow merge; per-call headers override defaults.
- **`middlewares`**, **`transformRequest`**, **`transformResponse`**: **concatenated** (defaults first, then call-specific).
- **`retry`**, **`memoryCache`**: shallow merge of objects.
- Prototype-pollution keys (`__proto__`, `constructor`, `prototype`) are stripped from merged objects and nested `headers` / `retry` / `memoryCache`.

## Next

- [Interceptors & middleware](./interceptors-middleware.md)

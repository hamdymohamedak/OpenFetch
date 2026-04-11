# openFetch — quick reference

## Config highlights (`OpenFetchConfig`)

`url`, `baseURL`, `method`, `params`, `headers`, `data`, `body`, `timeout`, `signal`, `auth` (Basic), `withCredentials`, `responseType` (`json` | `text` | `blob` | `arraybuffer` | `stream`), `validateStatus`, `transformRequest` / `transformResponse` (arrays, concatenated with defaults), `middlewares`, `retry`, `memoryCache`, `unwrapResponse`, plus `RequestInit` passthrough (`cache`, `credentials`, `mode`, `redirect`, …).

## `OpenFetchError` codes (common)

| Code | Meaning |
|------|--------|
| `ERR_BAD_RESPONSE` | Status failed `validateStatus` |
| `ERR_NETWORK` | Network / throw from `fetch` |
| `ERR_PARSE` | Body parse failed |
| `ERR_CANCELED` | Aborted (timeout or external signal) |

## Merge rules (`mergeConfig`)

Later wins for top-level keys. `headers` shallow-merged. `middlewares`, `transformRequest`, `transformResponse` **concatenated**. `retry` / `memoryCache` shallow-merged.

# Errors & security

## `OpenFetchError`

Subclass of `Error` with optional:

- **`code`** — Machine-readable string  
- **`config`** — Merged request config (may contain secrets)  
- **`response`** — Present for failed `validateStatus` (`ERR_BAD_RESPONSE`)  
- **`request`** — `{ url }` when available  

### Codes (common)

| Code | Meaning |
|------|---------|
| `ERR_BAD_RESPONSE` | HTTP status failed `validateStatus` |
| `ERR_NETWORK` | Network / unexpected throw from `fetch` |
| `ERR_PARSE` | Response body could not be parsed |
| `ERR_CANCELED` | Aborted (timeout or external signal) |

## `isOpenFetchError`

Type guard: `err is OpenFetchError`.

## Logging — `toShape()` / `toJSON()`

`toShape()` returns a plain object: `message`, `status`, `url`, `method`, optional `data` / `headers`, `code`.

- **`config.auth` is omitted** from the shape, but the **live error instance** may still hold full `config` — do not send it raw to clients.
- For shared or client-facing logs, prefer:

```ts
error.toShape({
  includeResponseData: false,
  includeResponseHeaders: false,
});
```

Default `toShape()` / `toJSON()` **includes** response data and headers (backward compatible).

## `assertSafeHttpUrl(url)`

Optional **server-side** guard when the URL may be influenced by **untrusted** input.

- Allows only **`http:`** / **`https:`**.
- Rejects **localhost** and **literal** private / loopback / link-local **IPv4** and common **IPv6** cases.
- Does **not** stop **DNS rebinding** (hostname resolving to internal IPs). Combine with hostname allowlists, egress controls, or proxies as needed.

Throws `Error` with messages prefixed `openfetch: assertSafeHttpUrl:`.

## Memory cache and auth

See [Retry & cache](./retry-cache.md): use **`varyHeaderNames`** or a custom key for per-user GETs.

## Further reading

- Package **`SECURITY.md`** and **`npm run test:security`** (security test harness in the repo).

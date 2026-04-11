# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-04-11

### Added

- **`rawResponse` / fluent `.raw()`** — Returns the native `fetch` `Response` as `data` without reading the body in the adapter; skips `transformRequest`/`parseBody`/`transformResponse` on that path. Client response interceptors still run (`data` is the `Response`). Documented in types and README.
- **`createFluentClient()`** (`@hamdymohamedak/openfetch/sugar`) — Callable URL + method chaining (`.get()`, `.post()`, …); terminal methods (`.json()`, `.text()`, `.send()`, `.raw()`, …) each start a request unless **`.memo()`** is used.
- **`.memo()`** — Request-level memoization: one HTTP round-trip; body buffered once as `ArrayBuffer`; subsequent terminals reuse it (not HTTP caching).
- **Subpath exports** — `package.json` `exports`: `"./plugins"` and `"./sugar"` for tree-shaking.
- **Plugins** (`@hamdymohamedak/openfetch/plugins`) — `retry()`, `timeout()`, `hooks()`, `debug()`, `strictFetch()` wrapping `createRetryMiddleware` and related behavior.
- **Retry middleware** — `retry.timeoutTotalMs` with monotonic timing (`performance.now()` when available); `enforceTotalTimeout` merges deadline into `signal` per attempt; `retry.timeoutPerAttemptMs` overrides per-attempt `timeout`; external `signal` abort stops the loop and short-circuits backoff; `retry.autoIdempotencyKey` / stable **`Idempotency-Key`** for POST when retrying non-idempotent methods; `clearTimeout` in `dispatch` `finally` for per-attempt timers.
- **Helpers** — `generateIdempotencyKey`, `hasIdempotencyKeyHeader`, `ensureIdempotencyKeyHeader`; **`maskHeaderValues`** with strategies **`full`**, **`partial`** (e.g. `Bearer ****abcd`), **`hash`** (short fingerprint); **`cloneResponse`** for multiple body reads.
- **Debug plugin** — `maskStrategy`, `maskPartialTailLength` (tail-only implies `partial`); optional masked request headers in logs.
- **Example** — `examples/plugins-fluent.example.ts`.
- **Tests** — `npm test`: Node built-in runner; masking, `cloneResponse`, fluent memo, middleware order vs retry, hooks placement, abort during backoff / pre-start, retry with `timeoutPerAttemptMs`.
- **Security tests** — Expanded `security-tests/run.mjs` coverage.
- **Documentation** — README: execution model (middleware order, retry loop, terminals, `rawResponse` semantics), fluent/memo/debug/masking notes; **SECURITY.md** updates.

### Changed

- **`dispatch`** — `rawResponse` early return path; timeout cleanup in `finally`.
- **`OpenFetchRetryOptions` / types** — Extended retry and `rawResponse` documentation.

### Notes

- **`ERR_CANCELED`** from a per-attempt timeout is not retried (same as user abort).
- Published package **`files`** include `CHANGELOG.md` from this release onward.

# Security

## Threat model

openfetch is a thin `fetch` wrapper. Callers supply URLs, headers, and bodies. The library does **not** implement its own TLS, DNS, or full SSRF filtering.

- **Network trust** — You choose endpoints. Blocking private IPs, metadata hosts, or open redirects is an **application** concern for partially trusted URLs.
- **Secrets** — `toShape()` on `OpenFetchError` avoids echoing `config.auth`, but the full `Error` object may still carry `config` (including credentials). Response bodies and headers in `toShape()` may still contain tokens or PII; use `toShape({ includeResponseData: false, includeResponseHeaders: false })` when serializing for untrusted clients or broad logs. Never send raw errors to untrusted clients without redaction.
- **Supply chain** — Install this package from npm or a verified Git tag; verify integrity with your package manager.

## Server-side usage and SSRF

When a URL (or part of it) comes from user input or another untrusted source on **Node.js, Deno, edge workers, or similar**, `fetch` can reach internal addresses (SSRF), cloud metadata endpoints, or other restricted networks.

Mitigations (combine as appropriate):

- **Allowlist** hostnames or full URL prefixes your backend is allowed to call.
- **Block literal private IPs** — Use the optional helper `assertSafeHttpUrl(url)` before issuing the request. It rejects `http`/`https` URLs whose host is a loopback, private, link-local, or IPv4-mapped private address. It does **not** stop a public hostname from resolving to an internal IP (DNS rebinding); resolve and validate in a controlled resolver or use an outbound proxy.
- **Egress controls** — Route outbound HTTP through a proxy or service mesh that enforces policy.

## Memory cache and multi-tenant / authenticated traffic

`createCacheMiddleware` defaults to a cache key of ``METHOD fullUrl`` (plus optional custom `key`). That key does **not** include `Authorization`, `Cookie`, or other `Vary` inputs unless you add them.

**Risk:** In a BFF, SSR, or shared worker, the first successful response for a URL can be served to **other** callers until the entry expires — cross-user or cross-tenant data leakage.

**Mitigations:**

- Pass `varyHeaderNames: ["authorization", "cookie"]` (and any other headers your origin varies on), **or**
- Provide a custom `key` that incorporates a stable tenant or session identifier, **or**
- Use `appendCacheKeyVaryHeaders` when building a custom key.

Unauthenticated, fully public GETs may keep the default key.

## Retry and non-idempotent methods

By default, `createRetryMiddleware` retries network/parse failures and configured HTTP error statuses **only** for `GET`, `HEAD`, `OPTIONS`, and `TRACE`, to reduce duplicate side effects (for example double charges on `POST`).

Set `retry.retryNonIdempotentMethods: true` on the client defaults or per request when you explicitly want retries for `POST`, `PUT`, `PATCH`, or `DELETE`.

## Hardening in the library

- `mergeConfig` drops own properties named `__proto__`, `constructor`, and `prototype` on the merged config, `headers`, `retry`, and `memoryCache` to reduce prototype pollution from untrusted config objects.
- Invalid header values (for example containing CR/LF) are rejected by the runtime `fetch` implementation rather than being sent on the wire.

## Reporting issues

Email or open a **private** security advisory on the repository if you believe you have found a vulnerability. Please avoid public issues for undisclosed security defects until they are addressed.

## Security checks

From the repository root (after `npm install`):

```bash
npm run test:security
```

This runs static-style checks (config merging, header injection attempt, error shape, cache behavior, URL builder performance). It is **not** a full penetration test or formal audit.

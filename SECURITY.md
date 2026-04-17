# Security

## Threat model

openfetch is a thin `fetch` wrapper. Callers supply URLs, headers, and bodies. The library does **not** implement its own TLS, DNS, or full SSRF filtering.

- **Axios-class proxy CVEs (e.g. CVE-2025-62718 / `NO_PROXY` normalization)** — openfetch does **not** implement axios-style `HTTP_PROXY` / `HTTPS_PROXY` / `NO_PROXY` matching. Outbound routing follows the host runtime’s `fetch` (and any platform proxy). Those CVEs therefore do **not** map to openfetch code paths; policy still belongs at the app, proxy, or mesh layer.

- **Network trust** — You choose endpoints. Blocking private IPs, metadata hosts, or open redirects is an **application** concern for partially trusted URLs.
- **Secrets** — `toShape()` / `toJSON()` on `OpenFetchError` omit `config.auth` and, **by default**, omit response **`data`** and **`headers`** (pass `includeResponseData: true` / `includeResponseHeaders: true` only for trusted diagnostics). The live `Error` instance may still carry full `config` and `response`; never expose it raw to untrusted clients. By default, `toShape()` **redacts common sensitive query parameters** in the serialized `url` (for example `token`, `code`, `password`); use `redactSensitiveUrlQuery: false` only for trusted diagnostics. The `debug()` plugin applies the same redaction to logged URLs.
- **Supply chain** — Install this package from npm or a verified Git tag; verify integrity with your package manager.

## Server-side usage and SSRF

When a URL (or part of it) comes from user input or another untrusted source on **Node.js, Deno, edge workers, or similar**, `fetch` can reach internal addresses (SSRF), cloud metadata endpoints, or other restricted networks.

Mitigations (combine as appropriate):

- **Allowlist** hostnames or full URL prefixes your backend is allowed to call.
- **Block literal private IPs** — Call `assertSafeHttpUrl(url)` before issuing the request, or set **`assertSafeUrl: true`** on `createClient` / per request so the fully resolved URL is checked automatically inside the dispatcher. The helper rejects `http`/`https` URLs whose host is a loopback, private, link-local, or IPv4-mapped private address. On runtimes that use the WHATWG URL parser (including Node.js), hosts written as **decimal integers**, **hex/octal IPv4 segments**, or **shorthand** forms (for example `127.1`) are **normalized** to dotted-quad literals before `hostname` is read; `assertSafeHttpUrl` still applies its checks to that normalized host. It does **not** stop a public hostname from resolving to an internal IP (DNS rebinding); resolve and validate in a controlled resolver or use an outbound proxy.
- **Egress controls** — Route outbound HTTP through a proxy or service mesh that enforces policy.

## Memory cache and multi-tenant / authenticated traffic

`createCacheMiddleware` builds a cache key from ``METHOD fullUrl`` (plus optional custom `key`). **By default**, `authorization` and `cookie` request header values are folded into the key (and any extra names you pass in `varyHeaderNames` are merged with those two), so authenticated GETs do not share entries across different credentials.

**Risk:** If you set **`varyHeaderNames: []`** explicitly, the key is URL-only; the first successful response for that URL can be served to **other** callers until the entry expires.

**Mitigations:**

- Omit `varyHeaderNames` (secure default), or pass additional header names (they are merged with `authorization` and `cookie`), **or**
- Provide a custom `key` that incorporates a stable tenant or session identifier, **or**
- Use `appendCacheKeyVaryHeaders` when building a custom key.

The middleware emits a **one-time `console.warn`** the first time it sees `Authorization` or `Cookie` while `varyHeaderNames` was explicitly set to `[]` and no custom `key` is set. Suppress with `suppressAuthCacheKeyWarning: true` when that configuration is intentional (for example anonymous-only CDN).

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
npm audit
```

`test:security` runs regression-style checks (config merging and prototype-pollution keys, header injection attempt, error shape, cache and `varyHeaderNames` behavior, `assertSafeHttpUrl` including Node URL normalization cases, URL builder performance). It is **not** a full penetration test or formal audit.

**Optional static analysis (Semgrep):** Semgrep is not an npm dependency of this package. To scan `src/` locally, use a virtualenv or [pipx](https://pypa.github.io/pipx/), for example:

```bash
python3 -m venv .venv && .venv/bin/pip install semgrep
.venv/bin/semgrep scan --config p/typescript --config p/javascript src
```

Review any findings manually; rules can produce false positives on thin wrappers.

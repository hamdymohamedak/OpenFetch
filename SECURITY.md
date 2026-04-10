# Security

## Threat model

openfetch is a thin `fetch` wrapper. Callers supply URLs, headers, and bodies. The library does **not** implement its own TLS, DNS, or SSRF filtering.

- **Network trust** — You choose endpoints. Blocking private IPs, metadata hosts, or open redirects is an **application** concern.
- **Secrets** — `toShape()` on `OpenFetchError` avoids echoing `config.auth`, but the full `Error` object may still carry `config` (including credentials). Never send raw errors to untrusted clients or public logs without redaction.
- **Supply chain** — Install this package from npm or a verified Git tag; verify integrity with your package manager.

## Hardening in the library

- `mergeConfig` drops own properties named `__proto__`, `constructor`, and `prototype` on the merged config and on `headers` to reduce prototype pollution from untrusted config objects.
- Invalid header values (for example containing CR/LF) are rejected by the runtime `fetch` implementation rather than being sent on the wire.

## Reporting issues

Email or open a **private** security advisory on the repository if you believe you have found a vulnerability. Please avoid public issues for undisclosed security defects until they are addressed.

## Security checks

From the repository root (after `npm install`):

```bash
npm run test:security
```

This runs static-style checks (config merging, header injection attempt, error shape, cache behavior, URL builder performance). It is **not** a full penetration test or formal audit.

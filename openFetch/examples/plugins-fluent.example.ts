/**
 * Plugins + fluent client (reference only — not part of `tsc` build).
 *
 * ```ts
 * import {
 *   createFluentClient,
 *   retry,
 *   timeout,
 * } from "@hamdymohamedak/openfetch";
 * // Tree-shake plugins only:
 * // import { retry, timeout } from "@hamdymohamedak/openfetch/plugins";
 *
 * const client = createFluentClient({ baseURL: "https://api.example.com" })
 *   .use(retry({ attempts: 3 }))
 *   .use(timeout(5000));
 *
 * const data = await client("/v1/user").json<{ id: string }>();
 * ```
 *
 * Register `retry` before `timeout` so retries wrap the full inner chain.
 * Optional: `hooks({ onRequest, onResponse, onError })`, `debug()`, `strictFetch()`.
 */
export {};

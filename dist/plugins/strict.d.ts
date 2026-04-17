import type { Middleware } from "../domain/types.js";
/**
 * Stricter defaults for requests that did not set `redirect` explicitly:
 * `redirect: 'error'` so redirects are not followed silently (fetch-native).
 */
export declare function strictFetch(): Middleware;
//# sourceMappingURL=strict.d.ts.map
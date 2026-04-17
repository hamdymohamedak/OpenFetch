import type { Middleware } from "../domain/types.js";

/**
 * Stricter defaults for requests that did not set `redirect` explicitly:
 * `redirect: 'error'` so redirects are not followed silently (fetch-native).
 */
export function strictFetch(): Middleware {
  return async (ctx, next) => {
    if (ctx.request.redirect === undefined) {
      ctx.request.redirect = "error";
    }
    await next();
  };
}

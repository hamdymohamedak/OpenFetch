import type { Middleware } from "../types/index.js";

/**
 * Sets `request.timeout` (ms) for each request. Actual abort is handled in `dispatch` via `AbortController`.
 * Last registered `timeout` plugin wins if several run (each overwrites `ctx.request.timeout` before `next`).
 */
export function timeout(ms: number): Middleware {
  return async (ctx, next) => {
    ctx.request.timeout = ms;
    await next();
  };
}

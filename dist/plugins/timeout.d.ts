import type { Middleware } from "../domain/types.js";
/**
 * Sets `request.timeout` (ms) for each request. Actual abort is handled in `dispatch` via `AbortController`.
 * Last registered `timeout` plugin wins if several run (each overwrites `ctx.request.timeout` before `next`).
 */
export declare function timeout(ms: number): Middleware;
//# sourceMappingURL=timeout.d.ts.map
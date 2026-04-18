import type {
  Middleware,
  OpenFetchContext,
  OpenFetchRetryOptions,
} from "../domain/types.js";

export type HooksPluginOptions = {
  /** Runs before the rest of the middleware stack and `fetch`. */
  onRequest?: (ctx: OpenFetchContext) => void | Promise<void>;
  /** Runs after a successful `next()` when `ctx.response` is set. */
  onResponse?: (ctx: OpenFetchContext) => void | Promise<void>;
  /** Runs when `next()` throws; the error is rethrown after the hook. */
  onError?: (ctx: OpenFetchContext, error: unknown) => void | Promise<void>;
  /** See `OpenFetchRetryOptions.onBeforeRetry` (merged into `ctx.request.retry`). */
  onBeforeRetry?: OpenFetchRetryOptions["onBeforeRetry"];
  /** See `OpenFetchRetryOptions.onAfterResponse` (merged into `ctx.request.retry`). */
  onAfterResponse?: OpenFetchRetryOptions["onAfterResponse"];
};

/**
 * Lifecycle hooks as a single middleware. For transforming config/response, prefer interceptors.
 */
export function hooks(options: HooksPluginOptions): Middleware {
  const { onRequest, onResponse, onError, onBeforeRetry, onAfterResponse } =
    options;
  return async (ctx, next) => {
    if (onBeforeRetry != null || onAfterResponse != null) {
      const r = ctx.request.retry ?? {};
      const prevBefore = r.onBeforeRetry;
      const prevAfter = r.onAfterResponse;
      ctx.request.retry = {
        ...r,
        onBeforeRetry:
          prevBefore && onBeforeRetry
            ? async (c, i) => {
                await prevBefore(c, i);
                await onBeforeRetry(c, i);
              }
            : onBeforeRetry ?? prevBefore,
        onAfterResponse:
          prevAfter && onAfterResponse
            ? async (c, res) => {
                await prevAfter(c, res);
                await onAfterResponse(c, res);
              }
            : onAfterResponse ?? prevAfter,
      };
    }
    if (onRequest) await onRequest(ctx);
    try {
      await next();
      if (onResponse && ctx.response != null) await onResponse(ctx);
    } catch (err) {
      if (onError) await onError(ctx, err);
      throw err;
    }
  };
}

import {
  maskHeaderValues,
  type MaskHeaderOptions,
  type MaskHeaderStrategy,
} from "../helpers/maskHeaders.js";
import { redactSensitiveUrlQuery } from "../helpers/redactUrlQuery.js";
import type { Middleware, OpenFetchContext } from "../types/index.js";

export type DebugPhase = "request" | "response" | "error";

export type DebugLogPayload = {
  method: string;
  url: string;
  status?: number;
  ms?: number;
  error?: string;
  /** Present when `includeRequestHeaders` is true (values masked per `maskHeaders`). */
  headers?: Record<string, string>;
};

export type DebugPluginOptions = {
  /** When true, logs a compact line to `console`. Default true if no `log` function. */
  enabled?: boolean;
  /** Custom sink; receives phase and a shallow snapshot-friendly payload. */
  log?: (phase: DebugPhase, payload: DebugLogPayload) => void;
  /**
   * Header names (case-insensitive) to redact when `includeRequestHeaders` is true.
   * Default: authorization, cookie, set-cookie, x-api-key.
   */
  maskHeaders?: string[];
  /**
   * How sensitive header values are redacted when `includeRequestHeaders` is true.
   * `partial` keeps a short tail (e.g. `Bearer ****abcd`). `hash` logs a stable short fingerprint.
   */
  maskStrategy?: MaskHeaderStrategy;
  /** For `maskStrategy: "partial"`, number of characters visible at the end (default 4). */
  maskPartialTailLength?: number;
  /** When true, includes masked request headers on the `request` phase (never raw secrets). */
  includeRequestHeaders?: boolean;
  /**
   * When true (default), redacts sensitive query parameter values in logged URLs
   * (same built-in list as `redactSensitiveUrlQuery` from the main package export).
   */
  maskUrlQuery?: boolean;
  /** Extra query parameter names to redact in the logged URL (case-insensitive). */
  sensitiveQueryParamNames?: string[];
  /** Replacement string for redacted query values in the logged URL (default `"[REDACTED]"`). */
  sensitiveQueryParamReplacement?: string;
};

function resolveUrl(ctx: OpenFetchContext): string {
  try {
    const u = ctx.request.url;
    return typeof u === "string" ? u : u instanceof URL ? u.href : String(u);
  } catch {
    return "";
  }
}

/**
 * Development-oriented logging middleware. Omit from production bundles if unused.
 */
export function debug(options: DebugPluginOptions = {}): Middleware {
  const enabled = options.enabled !== false;
  const maskList = options.maskHeaders;
  const maskOpts: MaskHeaderOptions | undefined =
    options.maskStrategy != null || options.maskPartialTailLength != null
      ? {
          maskNames: maskList,
          strategy:
            options.maskStrategy ??
            (options.maskPartialTailLength != null ? "partial" : undefined),
          partialTailLength: options.maskPartialTailLength,
        }
      : maskList != null
        ? { maskNames: maskList }
        : undefined;
  const includeReqH = options.includeRequestHeaders === true;
  const maskUrlQ = options.maskUrlQuery !== false;
  const sensitiveQueryParams = options.sensitiveQueryParamNames;
  const sensitiveQueryReplacement = options.sensitiveQueryParamReplacement;
  const log =
    options.log ??
    ((phase, p) => {
      if (typeof console !== "undefined" && console.debug) {
        console.debug(`[openfetch] ${phase}`, p);
      }
    });

  return async (ctx, next) => {
    if (!enabled) {
      await next();
      return;
    }
    const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
    const method = (ctx.request.method ?? "GET").toUpperCase();
    const rawUrl = resolveUrl(ctx);
    const url = maskUrlQ
      ? redactSensitiveUrlQuery(rawUrl, {
          enabled: true,
          paramNames: sensitiveQueryParams,
          replacement: sensitiveQueryReplacement,
        })
      : rawUrl;
    const reqPayload: DebugLogPayload = { method, url };
    if (includeReqH) {
      const masked = maskHeaderValues(
        ctx.request.headers,
        maskOpts ?? maskList
      );
      if (masked) reqPayload.headers = masked;
    }
    log("request", reqPayload);
    try {
      await next();
      const ms =
        (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0;
      log("response", {
        method,
        url,
        status: ctx.response?.status,
        ms: Math.round(ms),
      });
    } catch (e) {
      const ms =
        (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0;
      log("error", {
        method,
        url,
        ms: Math.round(ms),
        error: e instanceof Error ? e.message : String(e),
      });
      throw e;
    }
  };
}

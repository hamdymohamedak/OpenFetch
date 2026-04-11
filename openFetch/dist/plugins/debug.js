import { maskHeaderValues, } from "../helpers/maskHeaders.js";
function resolveUrl(ctx) {
    try {
        const u = ctx.request.url;
        return typeof u === "string" ? u : u instanceof URL ? u.href : String(u);
    }
    catch {
        return "";
    }
}
/**
 * Development-oriented logging middleware. Omit from production bundles if unused.
 */
export function debug(options = {}) {
    const enabled = options.enabled !== false;
    const maskList = options.maskHeaders;
    const maskOpts = options.maskStrategy != null || options.maskPartialTailLength != null
        ? {
            maskNames: maskList,
            strategy: options.maskStrategy ??
                (options.maskPartialTailLength != null ? "partial" : undefined),
            partialTailLength: options.maskPartialTailLength,
        }
        : maskList != null
            ? { maskNames: maskList }
            : undefined;
    const includeReqH = options.includeRequestHeaders === true;
    const log = options.log ??
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
        const url = resolveUrl(ctx);
        const reqPayload = { method, url };
        if (includeReqH) {
            const masked = maskHeaderValues(ctx.request.headers, maskOpts ?? maskList);
            if (masked)
                reqPayload.headers = masked;
        }
        log("request", reqPayload);
        try {
            await next();
            const ms = (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0;
            log("response", {
                method,
                url,
                status: ctx.response?.status,
                ms: Math.round(ms),
            });
        }
        catch (e) {
            const ms = (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0;
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

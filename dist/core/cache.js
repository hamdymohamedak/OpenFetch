import { buildURL } from "../helpers/buildURL.js";
import { dispatch } from "./dispatch.js";
export class MemoryCacheStore {
    map = new Map();
    maxEntries;
    constructor(options) {
        this.maxEntries = options?.maxEntries ?? 500;
    }
    get(key) {
        return this.map.get(key);
    }
    set(key, entry) {
        while (this.maxEntries > 0 && this.map.size >= this.maxEntries) {
            const first = this.map.keys().next().value;
            if (first === undefined)
                break;
            this.map.delete(first);
        }
        this.map.set(key, entry);
    }
    delete(key) {
        this.map.delete(key);
    }
    clear() {
        this.map.clear();
    }
}
function shallowCloneResponse(r) {
    return {
        ...r,
        headers: { ...r.headers },
        config: { ...r.config },
        data: r.data,
    };
}
function headersHaveAuthOrCookie(headers) {
    if (!headers)
        return false;
    for (const k of Object.keys(headers)) {
        const l = k.toLowerCase();
        if (l === "authorization" || l === "cookie")
            return true;
    }
    return false;
}
/** Append a stable suffix from header values so cache keys differ per auth/cookie (etc.). */
export function appendCacheKeyVaryHeaders(baseKey, headers, headerNames) {
    if (!headerNames.length)
        return baseKey;
    const lowerToValue = new Map();
    if (headers) {
        for (const [k, v] of Object.entries(headers)) {
            lowerToValue.set(k.toLowerCase(), v);
        }
    }
    const parts = headerNames.map((name) => {
        const v = lowerToValue.get(name.toLowerCase());
        return `${name.toLowerCase()}:${v ?? ""}`;
    });
    return `${baseKey}\u001f${parts.join("\u001f")}`;
}
function revalidateInBackground(key, store, request, ttlMs, swrMs, inflight) {
    if (inflight.has(key))
        return;
    const p = (async () => {
        try {
            const cfg = {
                ...request,
                memoryCache: { ...request.memoryCache, skip: true },
                url: request.url,
            };
            const res = await dispatch(cfg);
            const storedAt = Date.now();
            store.set(key, {
                response: shallowCloneResponse(res),
                freshUntil: storedAt + ttlMs,
                expireAt: storedAt + ttlMs + swrMs,
            });
        }
        catch {
            // background refresh failed — stale entry remains until expireAt
        }
        finally {
            inflight.delete(key);
        }
    })();
    inflight.set(key, p);
}
/**
 * In-memory cache with TTL and optional stale-while-revalidate (background `dispatch`).
 * Skips when `memoryCache.skip` is true. Uses `memoryCache.ttlMs` / `staleWhileRevalidateMs` per request when set.
 * For per-user or authenticated responses, set `varyHeaderNames` (e.g. `["authorization","cookie"]`) or a custom `key`.
 */
export function createCacheMiddleware(store, options) {
    const defaultTtl = options?.ttlMs ?? 60_000;
    const defaultSwr = options?.staleWhileRevalidateMs ?? 0;
    const varyHeaderNames = options?.varyHeaderNames ?? [];
    const methods = new Set((options?.methods ?? ["GET", "HEAD"]).map((m) => m.toUpperCase()));
    const inflight = new Map();
    let authCacheKeyWarningIssued = false;
    return async (ctx, next) => {
        if (ctx.request.memoryCache?.skip) {
            await next();
            return;
        }
        const method = (ctx.request.method ?? "GET").toUpperCase();
        if (!methods.has(method)) {
            await next();
            return;
        }
        const urlString = buildURL(ctx.request.url, ctx.request);
        const rawKey = options?.key?.({ request: ctx.request, url: urlString }) ??
            `${method} ${urlString}`;
        if (!authCacheKeyWarningIssued &&
            options?.suppressAuthCacheKeyWarning !== true &&
            options?.key === undefined &&
            varyHeaderNames.length === 0 &&
            headersHaveAuthOrCookie(ctx.request.headers)) {
            authCacheKeyWarningIssued = true;
            if (typeof console !== "undefined" && typeof console.warn === "function") {
                console.warn("[openfetch] createCacheMiddleware: request uses Authorization or Cookie but varyHeaderNames is empty and no custom key is set; cache entries may be shared across users. Use varyHeaderNames: [\"authorization\", \"cookie\"] or options.key, or set suppressAuthCacheKeyWarning: true if this is intentional.");
            }
        }
        const key = appendCacheKeyVaryHeaders(rawKey, ctx.request.headers, varyHeaderNames);
        const ttlMs = ctx.request.memoryCache?.ttlMs ?? defaultTtl;
        const swrMs = ctx.request.memoryCache?.staleWhileRevalidateMs ?? defaultSwr;
        const now = Date.now();
        const hit = store.get(key);
        if (hit) {
            if (now < hit.freshUntil) {
                ctx.response = shallowCloneResponse(hit.response);
                return;
            }
            if (now < hit.expireAt) {
                ctx.response = shallowCloneResponse(hit.response);
                if (swrMs > 0) {
                    revalidateInBackground(key, store, ctx.request, ttlMs, swrMs, inflight);
                }
                return;
            }
        }
        await next();
        if (ctx.error)
            return;
        if (!ctx.response)
            return;
        const storedAt = Date.now();
        store.set(key, {
            response: shallowCloneResponse(ctx.response),
            freshUntil: storedAt + ttlMs,
            expireAt: storedAt + ttlMs + swrMs,
        });
    };
}

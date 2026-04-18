import { InterceptorManager } from "../domain/interceptors.js";
import { mergeConfig } from "../shared/mergeConfig.js";
import { openFetchConfigFromRequest } from "../shared/requestFromNative.js";
import { dispatch } from "../transport/dispatch.js";
import { applyMiddlewares } from "./middleware.js";
function withJsonHint(data, config) {
    const headers = { ...(config.headers ?? {}) };
    const hasCt = Boolean(headers["content-type"]) || Boolean(headers["Content-Type"]);
    if (data !== undefined &&
        data !== null &&
        typeof data === "object" &&
        !(data instanceof FormData) &&
        !(data instanceof URLSearchParams) &&
        !(data instanceof Blob) &&
        !(data instanceof ArrayBuffer) &&
        !ArrayBuffer.isView(data) &&
        !hasCt) {
        headers["content-type"] = "application/json";
    }
    return { ...config, headers };
}
export function createClient(initialDefaults = {}) {
    const defaults = initialDefaults;
    const requestInterceptors = new InterceptorManager();
    const responseInterceptors = new InterceptorManager();
    async function run(urlOrConfig, config) {
        let merged;
        if (urlOrConfig instanceof Request) {
            merged = mergeConfig(mergeConfig(defaults, openFetchConfigFromRequest(urlOrConfig)), config ?? {});
        }
        else if (typeof urlOrConfig === "string" || urlOrConfig instanceof URL) {
            merged = mergeConfig(defaults, { ...config, url: urlOrConfig });
        }
        else {
            merged = mergeConfig(defaults, urlOrConfig);
        }
        for (const fn of merged.init ?? []) {
            fn(merged);
        }
        if (merged.url === undefined || merged.url === "") {
            throw new Error("openfetch: `url` is required");
        }
        const afterRequest = await requestInterceptors.runRequest(merged);
        const ctx = {
            url: afterRequest.url,
            request: afterRequest,
            response: null,
            error: null,
        };
        await applyMiddlewares(ctx, async () => {
            const cfg = ctx.request;
            ctx.response = await dispatch(cfg);
        });
        // Stale ctx.error can remain from an earlier failed `next()` inside retry middleware; prefer a successful response.
        if (ctx.error != null && ctx.response == null)
            throw ctx.error;
        let response = ctx.response;
        response = (await responseInterceptors.runResponse(response));
        if (afterRequest.unwrapResponse) {
            return response.data;
        }
        return response;
    }
    const client = {
        defaults,
        interceptors: {
            request: requestInterceptors,
            response: responseInterceptors,
        },
        request: run,
        get(url, config = {}) {
            return run(url, { ...config, method: "GET" });
        },
        post(url, data, config = {}) {
            return run(url, withJsonHint(data, { ...config, method: "POST", data }));
        },
        put(url, data, config = {}) {
            return run(url, withJsonHint(data, { ...config, method: "PUT", data }));
        },
        patch(url, data, config = {}) {
            return run(url, withJsonHint(data, { ...config, method: "PATCH", data }));
        },
        delete(url, config = {}) {
            return run(url, { ...config, method: "DELETE" });
        },
        head(url, config = {}) {
            return run(url, { ...config, method: "HEAD" });
        },
        options(url, config = {}) {
            return run(url, { ...config, method: "OPTIONS" });
        },
        use(fn) {
            if (!defaults.middlewares)
                defaults.middlewares = [];
            defaults.middlewares.push(fn);
            return client;
        },
    };
    return client;
}
/** Alias for {@link createClient}. */
export const create = createClient;

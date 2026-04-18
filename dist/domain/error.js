import { buildURL } from "../shared/buildURL.js";
import { redactSensitiveUrlQuery, } from "../shared/redactUrlQuery.js";
function resolveUrl(config) {
    if (config?.url === undefined || config.url === "")
        return "";
    try {
        return buildURL(config.url, config);
    }
    catch {
        return String(config.url);
    }
}
export class OpenFetchError extends Error {
    config;
    code;
    response;
    request;
    constructor(message, options) {
        super(message);
        this.name = "OpenFetchError";
        if (options?.config !== undefined)
            this.config = options.config;
        if (options?.code !== undefined)
            this.code = options.code;
        if (options?.response !== undefined)
            this.response = options.response;
        if (options?.request !== undefined)
            this.request = options.request;
    }
    /**
     * Plain object: `message`, `status`, `url`, `method`, optional `data` / `headers`, `code`.
     * Omits `config.auth`; the live `OpenFetchError` instance may still hold secrets — do not expose it raw to clients.
     * By default omits `data` and `headers`; pass `includeResponseData: true` / `includeResponseHeaders: true` for trusted diagnostics.
     */
    toShape(options) {
        let url = this.request?.url ??
            resolveUrl(this.config) ??
            "";
        const redactOpts = {
            enabled: options?.redactSensitiveUrlQuery !== false,
            paramNames: options?.sensitiveQueryParamNames,
            replacement: options?.sensitiveQueryParamReplacement,
        };
        url = redactSensitiveUrlQuery(url, redactOpts);
        const method = (this.config?.method ?? "GET").toUpperCase();
        const includeData = options?.includeResponseData === true;
        const includeHeaders = options?.includeResponseHeaders === true;
        const shape = {
            message: this.message,
            status: this.response?.status,
            url,
            method,
            code: this.code,
        };
        if (includeData)
            shape.data = this.response?.data;
        if (includeHeaders)
            shape.headers = this.response?.headers;
        return shape;
    }
    toJSON() {
        return this.toShape();
    }
}
export function isOpenFetchError(err) {
    return err instanceof OpenFetchError;
}
/** `OpenFetchError` with `code === "ERR_BAD_RESPONSE"` and a populated `response`. */
export function isHTTPError(err) {
    return (err instanceof OpenFetchError &&
        err.code === "ERR_BAD_RESPONSE" &&
        err.response != null);
}
/** Per-attempt fetch timeout (`ERR_TIMEOUT`) or retry budget exceeded (`ERR_RETRY_TIMEOUT`). */
export function isTimeoutError(err) {
    return (err instanceof OpenFetchError &&
        (err.code === "ERR_TIMEOUT" || err.code === "ERR_RETRY_TIMEOUT"));
}

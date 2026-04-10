import { buildURL } from "../helpers/buildURL.js";
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
    /** Plain object: `message`, `status`, `url`, `method`, `data`, `headers`, `code`. */
    toShape() {
        const url = this.request?.url ??
            resolveUrl(this.config) ??
            "";
        const method = (this.config?.method ?? "GET").toUpperCase();
        return {
            message: this.message,
            status: this.response?.status,
            url,
            method,
            data: this.response?.data,
            headers: this.response?.headers,
            code: this.code,
        };
    }
    toJSON() {
        return this.toShape();
    }
}
export function isOpenFetchError(err) {
    return err instanceof OpenFetchError;
}

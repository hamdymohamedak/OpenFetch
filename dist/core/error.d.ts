import type { OpenFetchConfig, OpenFetchResponse } from "../types/index.js";
/**
 * Serializable error shape (similar to Axios debugging payloads).
 * Safe to log or return from API routes.
 */
export type OpenFetchErrorShape = {
    message: string;
    status?: number;
    url: string;
    method: string;
    data?: unknown;
    headers?: Record<string, string>;
    code?: string;
};
export declare class OpenFetchError<T = unknown> extends Error {
    config?: OpenFetchConfig;
    code?: string;
    response?: OpenFetchResponse<T>;
    request?: {
        url: string;
    };
    constructor(message: string, options?: {
        config?: OpenFetchConfig;
        code?: string;
        response?: OpenFetchResponse<T>;
        request?: {
            url: string;
        };
    });
    /** Plain object: `message`, `status`, `url`, `method`, `data`, `headers`, `code`. */
    toShape(): OpenFetchErrorShape;
    toJSON(): OpenFetchErrorShape;
}
export declare function isOpenFetchError(err: unknown): err is OpenFetchError;
//# sourceMappingURL=error.d.ts.map
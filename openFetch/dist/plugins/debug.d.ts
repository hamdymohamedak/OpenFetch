import { type MaskHeaderStrategy } from "../helpers/maskHeaders.js";
import type { Middleware } from "../types/index.js";
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
};
/**
 * Development-oriented logging middleware. Omit from production bundles if unused.
 */
export declare function debug(options?: DebugPluginOptions): Middleware;
//# sourceMappingURL=debug.d.ts.map
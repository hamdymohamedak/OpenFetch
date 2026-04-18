import type { OpenFetchConfig } from "../domain/types.js";
/**
 * Map a native `Request` into {@link OpenFetchConfig} fields (URL, method, headers, body, signal, RequestInit picks).
 * Caller should merge with defaults / overrides via {@link mergeConfig}.
 */
export declare function openFetchConfigFromRequest(request: Request): OpenFetchConfig;
//# sourceMappingURL=requestFromNative.d.ts.map
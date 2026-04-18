/**
 * Throw from `retry.onAfterResponse` / hooks `onAfterResponse` (when wired through retry)
 * to force another fetch attempt (same semantics as Ky’s `ForceRetryError`).
 */
export declare class OpenFetchForceRetry extends Error {
    name: "OpenFetchForceRetry";
    constructor(message?: string);
}
export declare function isOpenFetchForceRetry(err: unknown): err is OpenFetchForceRetry;
//# sourceMappingURL=forceRetry.d.ts.map
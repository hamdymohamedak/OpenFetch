/**
 * Throw from `retry.onAfterResponse` / hooks `onAfterResponse` (when wired through retry)
 * to force another fetch attempt (same semantics as Ky’s `ForceRetryError`).
 */
export class OpenFetchForceRetry extends Error {
    name = "OpenFetchForceRetry";
    constructor(message = "Force retry") {
        super(message);
    }
}
export function isOpenFetchForceRetry(err) {
    return err instanceof OpenFetchForceRetry;
}

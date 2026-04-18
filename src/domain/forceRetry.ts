/**
 * Throw from `retry.onAfterResponse` / hooks `onAfterResponse` (when wired through retry)
 * to force another fetch attempt (same semantics as Ky’s `ForceRetryError`).
 */
export class OpenFetchForceRetry extends Error {
  override name = "OpenFetchForceRetry" as const;

  constructor(message = "Force retry") {
    super(message);
  }
}

export function isOpenFetchForceRetry(err: unknown): err is OpenFetchForceRetry {
  return err instanceof OpenFetchForceRetry;
}

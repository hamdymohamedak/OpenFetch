/**
 * Generates a value suitable for `Idempotency-Key` (Stripe-style deduplication on retries).
 * Uses `crypto.randomUUID()` when available; otherwise a time + random suffix.
 */
export declare function generateIdempotencyKey(): string;
export declare function hasIdempotencyKeyHeader(headers: Record<string, string> | undefined): boolean;
/**
 * Sets lowercase `idempotency-key` if no variant is already present (case-insensitive).
 */
export declare function ensureIdempotencyKeyHeader(headers: Record<string, string> | undefined, value: string): Record<string, string>;
//# sourceMappingURL=idempotencyKey.d.ts.map
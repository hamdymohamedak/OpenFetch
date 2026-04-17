/**
 * Generates a value suitable for `Idempotency-Key` (Stripe-style deduplication on retries).
 * Uses `crypto.randomUUID()` when available; otherwise a time + random suffix.
 */
export function generateIdempotencyKey(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  return `of_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

const HEADER = "idempotency-key";

export function hasIdempotencyKeyHeader(
  headers: Record<string, string> | undefined
): boolean {
  if (!headers) return false;
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === HEADER && v != null && String(v).trim() !== "") {
      return true;
    }
  }
  return false;
}

/**
 * Sets lowercase `idempotency-key` if no variant is already present (case-insensitive).
 */
export function ensureIdempotencyKeyHeader(
  headers: Record<string, string> | undefined,
  value: string
): Record<string, string> {
  const h = { ...(headers ?? {}) };
  const keys = Object.keys(h);
  for (const k of keys) {
    if (k.toLowerCase() === HEADER) {
      if (h[k] != null && String(h[k]).trim() !== "") {
        return h;
      }
      delete h[k];
    }
  }
  h[HEADER] = value;
  return h;
}

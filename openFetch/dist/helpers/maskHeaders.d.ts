export type MaskHeaderStrategy = "full" | "partial" | "hash";
export type MaskHeaderOptions = {
    /** Header names to treat as sensitive (case-insensitive). */
    maskNames?: string[];
    /** How to replace sensitive values. Default `full`. */
    strategy?: MaskHeaderStrategy;
    /** For `partial`: number of characters to keep visible at the end (default 4). */
    partialTailLength?: number;
};
/**
 * Returns a shallow copy of headers with sensitive names replaced (case-insensitive name match).
 * Pass a string array (header names) for backward compatibility, or {@link MaskHeaderOptions}
 * for `partial` (e.g. `Bearer ****abcd`) or `hash` (compact fingerprint for logs).
 */
export declare function maskHeaderValues(headers: Record<string, string> | undefined, maskNamesOrOptions?: string[] | MaskHeaderOptions): Record<string, string> | undefined;
//# sourceMappingURL=maskHeaders.d.ts.map
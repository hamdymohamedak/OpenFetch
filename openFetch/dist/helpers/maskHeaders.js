const DEFAULT_MASK = ["authorization", "cookie", "set-cookie", "x-api-key"];
function fnv1a32Hex(input) {
    let h = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).padStart(8, "0");
}
function maskValueFull() {
    return "[REDACTED]";
}
function maskValuePartial(value, tail) {
    const v = value.trim();
    const bearer = /^Bearer\s+(\S.*)$/i.exec(v);
    if (bearer) {
        const token = bearer[1].trim();
        if (token.length <= tail)
            return "Bearer ****";
        return `Bearer ****${token.slice(-tail)}`;
    }
    const basic = /^Basic\s+(\S+)$/i.exec(v);
    if (basic) {
        const cred = basic[1];
        if (cred.length <= tail)
            return "Basic ****";
        return `Basic ****${cred.slice(-tail)}`;
    }
    if (v.length <= tail)
        return "****";
    return `****${v.slice(-tail)}`;
}
function maskValueHash(value) {
    return `[h:${fnv1a32Hex(value)}]`;
}
function applyMask(value, strategy, partialTailLength) {
    if (strategy === "partial") {
        return maskValuePartial(value, partialTailLength);
    }
    if (strategy === "hash") {
        return maskValueHash(value);
    }
    return maskValueFull();
}
function normalizeMaskArg(maskNamesOrOptions) {
    if (maskNamesOrOptions == null) {
        return {
            maskNames: DEFAULT_MASK,
            strategy: "full",
            partialTailLength: 4,
        };
    }
    if (Array.isArray(maskNamesOrOptions)) {
        return {
            maskNames: maskNamesOrOptions,
            strategy: "full",
            partialTailLength: 4,
        };
    }
    const o = maskNamesOrOptions;
    return {
        maskNames: o.maskNames ?? DEFAULT_MASK,
        strategy: o.strategy ?? "full",
        partialTailLength: o.partialTailLength != null && o.partialTailLength > 0
            ? o.partialTailLength
            : 4,
    };
}
/**
 * Returns a shallow copy of headers with sensitive names replaced (case-insensitive name match).
 * Pass a string array (header names) for backward compatibility, or {@link MaskHeaderOptions}
 * for `partial` (e.g. `Bearer ****abcd`) or `hash` (compact fingerprint for logs).
 */
export function maskHeaderValues(headers, maskNamesOrOptions) {
    if (!headers || Object.keys(headers).length === 0)
        return undefined;
    const { maskNames, strategy, partialTailLength } = normalizeMaskArg(maskNamesOrOptions);
    const mask = new Set(maskNames.map((n) => n.toLowerCase()));
    const out = {};
    for (const [k, v] of Object.entries(headers)) {
        out[k] = mask.has(k.toLowerCase())
            ? applyMask(v, strategy, partialTailLength)
            : v;
    }
    return out;
}

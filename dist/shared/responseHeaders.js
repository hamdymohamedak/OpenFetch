/** Lowercase keys for consistent header lookup. */
export function headersToRecord(headers) {
    const out = {};
    headers.forEach((value, key) => {
        out[key.toLowerCase()] = value;
    });
    return out;
}

/** Lowercase keys, like Axios normalized headers object. */
export function headersToRecord(headers) {
    const out = {};
    headers.forEach((value, key) => {
        out[key.toLowerCase()] = value;
    });
    return out;
}

export function combineURLs(baseURL, relativeURL) {
    const base = baseURL.replace(/\/+$/, "");
    const rel = relativeURL.replace(/^\/+/, "");
    return base ? `${base}/${rel}` : rel;
}

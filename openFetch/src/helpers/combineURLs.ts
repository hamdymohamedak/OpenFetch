export function combineURLs(baseURL: string, relativeURL: string): string {
  const base = baseURL.replace(/\/+$/, "");
  const rel = relativeURL.replace(/^\/+/, "");
  return base ? `${base}/${rel}` : rel;
}

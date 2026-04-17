function appendParam(
  sp: URLSearchParams,
  key: string,
  value: unknown
): void {
  if (value === undefined || value === null) return;
  if (Array.isArray(value)) {
    for (const v of value) appendParam(sp, key, v);
    return;
  }
  if (typeof value === "object" && !(value instanceof Date)) {
    sp.append(key, JSON.stringify(value));
    return;
  }
  if (value instanceof Date) {
    sp.append(key, value.toISOString());
    return;
  }
  sp.append(key, String(value));
}

/** Default query serializer (flat keys, repeated keys for arrays). */
export function serializeParams(
  params: Record<string, unknown> | undefined,
  paramsSerializer?: (params: Record<string, unknown>) => string
): string {
  if (!params || Object.keys(params).length === 0) return "";
  if (paramsSerializer) return paramsSerializer(params);
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    appendParam(sp, k, v);
  }
  return sp.toString();
}

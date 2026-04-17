import { test } from "node:test";
import assert from "node:assert/strict";
import { redactSensitiveUrlQuery } from "../dist/shared/redactUrlQuery.js";

test("redactSensitiveUrlQuery masks token and leaves other params", () => {
  const u = "https://api.example.com/x?token=SECRET&foo=bar";
  const out = redactSensitiveUrlQuery(u);
  assert.equal(out.includes("SECRET"), false);
  assert.match(out, /token=.*REDACTED/);
  assert.ok(out.includes("foo=bar"));
});

test("redactSensitiveUrlQuery returns original when no sensitive params", () => {
  const u = "https://example.com/a?foo=1&bar=2";
  assert.equal(redactSensitiveUrlQuery(u), u);
});

test("redactSensitiveUrlQuery extra param names", () => {
  const u = "https://x.test/?custom=XYZ";
  const out = redactSensitiveUrlQuery(u, { paramNames: ["custom"] });
  assert.equal(out.includes("XYZ"), false);
});

test("redactSensitiveUrlQuery enabled false is noop", () => {
  const u = "https://x/?token=keep";
  assert.equal(redactSensitiveUrlQuery(u, { enabled: false }), u);
});

test("redactSensitiveUrlQuery invalid url unchanged", () => {
  assert.equal(redactSensitiveUrlQuery("not-a-url"), "not-a-url");
});

test("redactSensitiveUrlQuery relative path with sensitive param", () => {
  const u = "/api/users?token=SECRET&foo=bar";
  const out = redactSensitiveUrlQuery(u);
  assert.equal(out.includes("SECRET"), false);
  assert.match(out, /token=.*REDACTED/);
  assert.ok(out.startsWith("/api/users?"));
  assert.ok(out.includes("foo=bar"));
  assert.equal(out.includes("localhost"), false);
});

test("redactSensitiveUrlQuery partial / normalized param names", () => {
  const u =
    "https://x.test/?access-token=sec-one&user_access_token=sec-two&x-auth-token=sec-three&ok=1";
  const out = redactSensitiveUrlQuery(u);
  const parsed = new URL(out);
  for (const key of ["access-token", "user_access_token", "x-auth-token"]) {
    assert.deepEqual(parsed.searchParams.getAll(key), ["[REDACTED]"]);
  }
  assert.equal(parsed.searchParams.get("ok"), "1");
});

test("redactSensitiveUrlQuery preserves multiple values per key", () => {
  const u = "https://x.test/?token=1&token=2&z=3";
  const out = redactSensitiveUrlQuery(u);
  const params = new URL(out).searchParams.getAll("token");
  assert.equal(params.length, 2);
  assert.ok(params.every((v) => v === "[REDACTED]"));
});

test("redactSensitiveUrlQuery custom replacement", () => {
  const u = "https://x.test/?token=SECRET";
  assert.match(
    redactSensitiveUrlQuery(u, { replacement: "***" }),
    /token=\*\*\*/
  );
});

test("redactSensitiveUrlQuery query-only relative string", () => {
  const u = "?token=SECRET&x=1";
  const out = redactSensitiveUrlQuery(u);
  assert.equal(out.startsWith("?"), true);
  assert.equal(out.includes("SECRET"), false);
  assert.ok(out.includes("x=1"));
});

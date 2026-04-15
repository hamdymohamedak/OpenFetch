import { test } from "node:test";
import assert from "node:assert/strict";
import { redactSensitiveUrlQuery } from "../dist/helpers/redactUrlQuery.js";

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

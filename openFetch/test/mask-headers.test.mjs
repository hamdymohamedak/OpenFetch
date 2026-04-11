import { test } from "node:test";
import assert from "node:assert/strict";
import { maskHeaderValues } from "../dist/helpers/maskHeaders.js";

test("maskHeaderValues partial preserves Bearer tail", () => {
  const out = maskHeaderValues(
    { Authorization: "Bearer supersecret-token-ABCD" },
    { strategy: "partial", partialTailLength: 4 }
  );
  assert.equal(out.Authorization, "Bearer ****ABCD");
});

test("maskHeaderValues full redacts", () => {
  const out = maskHeaderValues(
    { Authorization: "Bearer x" },
    { strategy: "full" }
  );
  assert.equal(out.Authorization, "[REDACTED]");
});

test("maskHeaderValues hash is stable fingerprint", () => {
  const out = maskHeaderValues(
    { "x-api-key": "same" },
    { maskNames: ["x-api-key"], strategy: "hash" }
  );
  assert.match(out["x-api-key"], /^\[h:[0-9a-f]{8}\]$/);
});

test("backward compat: second arg as string array", () => {
  const out = maskHeaderValues(
    { Authorization: "Bearer secret" },
    ["authorization"]
  );
  assert.equal(out.Authorization, "[REDACTED]");
});

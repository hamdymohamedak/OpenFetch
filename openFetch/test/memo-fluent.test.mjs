import { test } from "node:test";
import assert from "node:assert/strict";
import { createFluentClient } from "../dist/sugar/fluent.js";

test("fluent memo shares one fetch for json and text", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response(JSON.stringify({ a: 1 }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    const fluent = createFluentClient({ unwrapResponse: true });
    const chain = fluent("http://example.test/memo", {
      url: "http://example.test/memo",
    }).memo();

    const j = await chain.json();
    const t = await chain.text();
    assert.deepEqual(j, { a: 1 });
    assert.ok(t.includes('"a"'));
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { cloneResponse } from "../dist/helpers/cloneResponse.js";

test("cloneResponse allows two body reads", async () => {
  const res = new Response("hello");
  const a = cloneResponse(res);
  const b = cloneResponse(res);
  assert.equal(await a.text(), "hello");
  assert.equal(await b.text(), "hello");
});

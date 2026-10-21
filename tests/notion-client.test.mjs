import assert from "node:assert/strict";
import { test } from "node:test";
import { notionRequest } from "../lib/notion/client.ts";

process.env.NOTION_TOKEN = "test-token";

test("retries Notion rate limits and returns the successful response", async (t) => {
  let attempts = 0;
  t.mock.method(globalThis, "fetch", async () => {
    attempts += 1;
    return attempts === 1
      ? new Response(null, { status: 429, headers: { "Retry-After": "0" } })
      : Response.json({ object: "list", results: [] });
  });
  assert.deepEqual(await notionRequest("/test"), { object: "list", results: [] });
  assert.equal(attempts, 2);
});

test("stops after four retries and reports persistent rate limits", async (t) => {
  const request = t.mock.method(globalThis, "fetch", async () => (
    new Response(null, { status: 429, headers: { "Retry-After": "0" } })
  ));
  await assert.rejects(notionRequest("/test"), /429/);
  assert.equal(request.mock.callCount(), 5);
});

test("reports other Notion errors without retrying", async (t) => {
  const request = t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 401 }));
  await assert.rejects(notionRequest("/test"), /401/);
  assert.equal(request.mock.callCount(), 1);
});

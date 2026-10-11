import assert from "node:assert/strict";
import { test } from "node:test";
import { sagaListRecommendations } from "../lib/saga-list-recommendations.ts";

const saga = { id: "saga", name: "Saga" };
const emptyFilter = { field: "", operator: "", value: "" };
const page = (id, extra = {}) => ({
  id, path: `/listas/${id}`, section: "listas", indexable: true,
  sagaIds: [], relatedStoryIds: [], mainStoryIds: [], dynamicCollection: false,
  filter1: emptyFilter, filter2: emptyFilter, publishedAt: null, createdAt: "2026-01-01", ...extra,
});
const signal = { id: "unpublished", authorId: null, filterValues: { "Subgénero": ["Thriller"], "Tropes": ["Venganza"] } };

test("prioritizes included books, including the reference book, over thematic lists", () => {
  const thematic = page("theme", { filter1: { field: "Subgénero", operator: "es", value: "Thriller" } });
  const direct = page("reference", { mainStoryIds: ["unpublished"] });
  const result = sagaListRecommendations([thematic, direct], [signal], saga, []);
  assert.equal(result.fallback, false);
  assert.deepEqual(result.pages.map((p) => p.id), ["reference", "theme"]);
});

test("requires both conditions to match the same book and rejects negative-only themes", () => {
  const lists = [
    page("wrong", { filter1: { field: "Subgénero", operator: "es", value: "Thriller" }, filter2: { field: "Tropes", operator: "es", value: "Mafia" } }),
    page("negative", { filter1: { field: "Tropes", operator: "no contiene", value: "Mafia" } }),
  ];
  assert.equal(sagaListRecommendations(lists, [signal], saga, []).fallback, true);
});

test("falls back to the three latest eligible lists without duplicates", () => {
  const newest = page("new", { publishedAt: "2026-10-11" });
  const lists = [page("old"), newest, newest, page("middle", { createdAt: "2026-09-01" }),
    page("fourth", { publishedAt: "2026-02-01" }), page("excluded", { indexable: false, createdAt: "2026-12-01" })];
  const result = sagaListRecommendations(lists, [], saga, []);
  assert.equal(result.fallback, true);
  assert.deepEqual(result.pages.map((p) => p.id), ["new", "middle", "fourth"]);
});

test("does not fill a partial selection with unrelated lists", () => {
  const result = sagaListRecommendations([page("related", { relatedStoryIds: [signal.id] }), page("other")], [signal], saga, []);
  assert.equal(result.fallback, false);
  assert.deepEqual(result.pages.map((p) => p.id), ["related"]);
  assert.deepEqual(sagaListRecommendations([], [], saga, []).pages, []);
});

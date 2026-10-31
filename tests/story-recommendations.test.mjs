import assert from "node:assert/strict";
import { test } from "node:test";
import { storyRecommendations } from "../lib/story-recommendations.ts";

test("keeps editorial categories and relation order, excluding self, duplicates and unpublished books", () => {
  const story = { id: "current", recommendationIds: {
    "Parecidos a": ["second", "first", "second", "current", "unpublished"],
    "Más spicy": ["first"], "Más oscuro": [],
  } };
  const published = [{ id: "current" }, { id: "first" }, { id: "second" }];
  const groups = storyRecommendations(story, published);
  assert.deepEqual(groups.map((g) => g.label), ["Parecidos a", "Más spicy"]);
  assert.deepEqual(groups[0].stories.map((s) => s.id), ["second", "first"]);
  assert.deepEqual(groups[1].stories.map((s) => s.id), ["first"]);
});

test("includes every linked published book without a display cap", () => {
  const published = Array.from({ length: 30 }, (_, id) => ({ id: String(id) }));
  assert.equal(storyRecommendations({ id: "current", recommendationIds: {
    "Más extremo": published.map((s) => s.id),
  } }, published)[0].stories.length, 30);
});

test("does not invent recommendations when relations are empty", () => {
  assert.deepEqual(storyRecommendations({ id: "current" }, [{ id: "other" }]), []);
});

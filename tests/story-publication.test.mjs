import assert from "node:assert/strict";
import { test } from "node:test";
import { mapNotionPageToStory } from "../lib/notion/mapper.ts";
import { recentStories } from "../lib/notion/recent-stories.ts";
import { sortStories } from "../lib/story-catalog.ts";

const story = (slug, batreadsPublishedAt, extra = {}) => ({
  slug, title: slug, batreadsPublishedAt,
  publishedAt: "2030-01-01", createdAt: "2030-01-01", ...extra,
});
const slugs = (stories) => stories.map(({ slug }) => slug);

test("reads Batreads publication separately from the book publication date", () => {
  const page = { id: "book", properties: {
    "Título": { type: "title", title: [{ plain_text: "Libro" }] },
    "Slug": { type: "rich_text", rich_text: [{ plain_text: "libro" }] },
    "Fecha publicación": { date: { start: "2020-01-01" } },
    "Fecha publicación en Batreads": { date: { start: "2026-10-19" } },
  } };
  const mapped = mapNotionPageToStory(page);
  assert.equal(mapped.publishedAt, "2020-01-01");
  assert.equal(mapped.batreadsPublishedAt, "2026-10-19");
  delete page.properties["Fecha publicación en Batreads"];
  assert.equal(mapNotionPageToStory(page).batreadsPublishedAt, null);
});

test("home and latest-added catalog use Batreads dates, leaving undated books last", () => {
  const stories = [
    story("undated", null),
    story("older", "2026-10-17"),
    story("latest", "2026-10-19", { publishedAt: "2000-01-01", createdAt: "2020-01-01" }),
    story("middle", "2026-10-18"),
  ];
  const originalOrder = slugs(stories);
  assert.deepEqual(slugs(sortStories(stories, "recommended")), ["latest", "middle", "older", "undated"]);
  assert.deepEqual(slugs(recentStories(stories, 2)), ["latest", "middle"]);
  assert.deepEqual(slugs(stories), originalOrder);
});

test("both views share a stable tie order and compare timestamps across time zones", () => {
  const stories = [
    story("beta", "2026-10-19"), story("alpha", "2026-10-19"),
    story("early", "2026-10-20T00:30:00+02:00"),
    story("late", "2026-10-19T23:00:00Z"),
    story("invalid", "invalid"),
  ];
  const expected = ["late", "early", "alpha", "beta", "invalid"];
  assert.deepEqual(slugs(recentStories(stories, 10)), expected);
  assert.deepEqual(slugs(sortStories(stories, "recommended")), expected);
});

test("other catalog sort options retain their criteria", () => {
  const stories = [
    story("a", "2026-10-19", { rating: 3, darkness: 5, spice: 2 }),
    story("b", "2026-10-17", { rating: 5, darkness: 2, spice: 4 }),
  ];
  assert.deepEqual(slugs(sortStories(stories, "rating")), ["b", "a"]);
  assert.deepEqual(slugs(sortStories(stories, "dark")), ["a", "b"]);
  assert.deepEqual(slugs(sortStories(stories, "spicy")), ["b", "a"]);
  assert.deepEqual(slugs(sortStories(stories, "title")), ["a", "b"]);
});

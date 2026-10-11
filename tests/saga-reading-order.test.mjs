import assert from "node:assert/strict";
import { test } from "node:test";
import { parseBookTitles, sagaReadingOrder } from "../lib/saga-reading-order.ts";

test("reads numbered titles separated by arrows, newlines and HTML breaks", () => {
  assert.deepEqual(parseBookTitles("1. Uno → 2) Dos\n3. Tres<br />4. Cuatro\r\n\n"), ["Uno", "Dos", "Tres", "Cuatro"]);
  assert.deepEqual(parseBookTitles(""), []);
});

const story = (id, sagaNumber, title = id) => ({ id, sagaNumber, title });

test("preserves gaps and places reviewed books by their explicit saga number", () => {
  const third = story("third", 3, "Título publicado");
  const entries = sagaReadingOrder({ bookCount: 3, bookTitles: ["Uno", "Dos", "Tres"] }, [third]);
  assert.deepEqual(entries, [
    { position: 1, title: "Uno", story: null },
    { position: 2, title: "Dos", story: null },
    { position: 3, title: "Título publicado", story: third },
  ]);
});

test("covers known titles and the highest published position beyond the stated count", () => {
  const fourth = story("fourth", 4);
  const entries = sagaReadingOrder({ bookCount: 2, bookTitles: ["Uno", "Dos", "Tres"] }, [fourth]);
  assert.equal(entries.length, 4);
  assert.equal(entries[2].title, "Tres");
  assert.equal(entries[3].story, fourth);
});

test("does not assign missing, invalid or duplicate numbers to arbitrary slots", () => {
  const entries = sagaReadingOrder({ bookCount: 3, bookTitles: ["Uno", "Dos"] }, [
    story("missing", null), story("fraction", 1.5), story("negative", -1),
    story("infinite", Infinity), story("a", 2), story("b", 2),
  ]);
  assert.deepEqual(entries, [
    { position: 1, title: "Uno", story: null },
    { position: 2, title: "Dos", story: null },
    { position: 3, title: null, story: null },
  ]);
});

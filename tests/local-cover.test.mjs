import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { readLocalCover } from "../lib/local-cover.ts";

test("cover reads stay inside public/images and enforce the size limit", async (t) => {
  const originalCwd = process.cwd();
  const root = await mkdtemp(path.join(os.tmpdir(), "batreads-covers-"));
  await mkdir(path.join(root, "public/images/covers"), { recursive: true });
  process.chdir(root);
  t.after(async () => {
    process.chdir(originalCwd);
    await rm(root, { recursive: true, force: true });
  });
  t.mock.method(globalThis, "fetch", () => { throw new Error("External requests are forbidden"); });

  await writeFile("public/images/covers/book.webp", "cover bytes");
  await writeFile("public/outside.webp", "outside");
  await symlink(path.join(root, "public/outside.webp"), "public/images/covers/escape.webp");

  await t.test("reads a local cover without making network requests", async () => {
    assert.equal((await readLocalCover("/images/covers/book.webp"))?.toString(), "cover bytes");
    assert.equal(globalThis.fetch.mock.callCount(), 0);
  });

  await t.test("rejects external URLs, traversal, missing files, directories and escaping symlinks", async () => {
    for (const input of [
      undefined, null, "", "https://example.com/cover.webp", "http://127.0.0.1/cover.webp",
      "//example.com/cover.webp", "public/images/covers/book.webp",
      "/images/../outside.webp", "/images/covers/../../outside.webp",
      "/images//etc/passwd", "/images/%2e%2e/outside.webp",
      "/images/covers/escape.webp", "/images/covers/missing.webp",
      "/images/covers", "/images/covers\\book.webp", "/images/covers/book.webp\0",
    ]) assert.equal(await readLocalCover(input), null, String(input));
    assert.equal(globalThis.fetch.mock.callCount(), 0);
  });

  await t.test("accepts 5 MB and rejects larger files", async () => {
    await writeFile("public/images/covers/limit.webp", Buffer.alloc(5_000_000, 1));
    assert.equal((await readLocalCover("/images/covers/limit.webp"))?.length, 5_000_000);
    await writeFile("public/images/covers/large.webp", Buffer.alloc(5_000_001, 1));
    assert.equal(await readLocalCover("/images/covers/large.webp"), null);
  });
});

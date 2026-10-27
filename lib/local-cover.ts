import { open, realpath } from "node:fs/promises";
import path from "node:path";

const MAX_COVER_BYTES = 5_000_000;

export async function readLocalCover(coverUrl?: string | null): Promise<Buffer | null> {
  if (!coverUrl?.startsWith("/images/") || coverUrl.includes("\\") || coverUrl.includes("\0")) return null;

  try {
    const imagesRoot = await realpath(path.join(process.cwd(), "public/images"));
    const imagePath = await realpath(path.resolve(imagesRoot, coverUrl.slice("/images/".length)));
    // Resolve symlinks as well as '..' before enforcing the directory boundary.
    if (!imagePath.startsWith(`${imagesRoot}${path.sep}`)) return null;

    const file = await open(imagePath, "r");
    try {
      const info = await file.stat();
      if (!info.isFile() || info.size > MAX_COVER_BYTES) return null;

      // Bound reads even if the file grows after the size check.
      const bytes = Buffer.alloc(Math.min(info.size + 1, MAX_COVER_BYTES + 1));
      let total = 0;
      while (total < bytes.length) {
        const { bytesRead } = await file.read(bytes, total, bytes.length - total, null);
        if (bytesRead === 0) break;
        total += bytesRead;
      }
      return total > info.size || total > MAX_COVER_BYTES ? null : bytes.subarray(0, total);
    } finally {
      await file.close();
    }
  } catch {
    return null;
  }
}

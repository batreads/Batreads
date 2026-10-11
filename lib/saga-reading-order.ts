import type { Saga, Story } from "./notion/types";

export function parseBookTitles(value: string): string[] {
  return value.split(/→|\r?\n|<br\s*\/?>/i)
    .map((line) => line.trim().replace(/^\d+[.)]\s*/, "").trim())
    .filter(Boolean);
}

export type ReadingOrderEntry = {
  position: number;
  title: string | null;
  story: Story | null;
};

export function sagaReadingOrder(saga: Pick<Saga, "bookCount" | "bookTitles">, stories: Story[]): ReadingOrderEntry[] {
  const numberedStories = new Map<number, Story[]>();
  for (const story of stories) {
    const position = story.sagaNumber;
    if (position === null || !Number.isSafeInteger(position) || position < 1) {
      console.warn(`Historia ${story.id}: N.º en saga ausente o inválido; no se asigna una posición.`);
      continue;
    }
    numberedStories.set(position, [...(numberedStories.get(position) ?? []), story]);
  }
  for (const [position, entries] of numberedStories) {
    if (entries.length > 1) console.warn(`N.º en saga duplicado (${position}): ${entries.map((story) => story.id).join(", ")}. No se enlaza una ficha en esa posición.`);
  }
  const bookCount = saga.bookCount !== null && Number.isSafeInteger(saga.bookCount) && saga.bookCount > 0 ? saga.bookCount : 0;
  const count = Math.max(bookCount, saga.bookTitles.length, ...numberedStories.keys());
  return Array.from({ length: count }, (_, index) => {
    const position = index + 1;
    const entries = numberedStories.get(position);
    const story = entries?.length === 1 ? entries[0] : null;
    return { position, title: story?.title || saga.bookTitles[index] || null, story };
  });
}

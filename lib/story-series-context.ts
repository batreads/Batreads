import type { Saga, Story } from "./notion/types";

export function storySeriesContext(story: Story, saga: Saga | undefined) {
  const isPrequel = story.slug.startsWith("obsesion-psicopata");
  const position = story.sagaNumber;
  const total = saga?.bookCount;
  const validPosition = position !== null && Number.isSafeInteger(position) && position > 0;
  const validTotal = total != null && Number.isSafeInteger(total) && total > 0;
  const label = !isPrequel && validPosition
    ? `Libro ${position}${validTotal && position <= total ? ` de ${total}` : ""}`
    : null;
  return { label };
}

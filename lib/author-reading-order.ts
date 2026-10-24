import type { EditorialBlock, Story } from "./notion";

export function storyForReadingCell(text: string, links: (string | null)[], stories: Story[]) {
  const normalized = text.trim().toLocaleLowerCase("es");
  return stories.find(story => links.some(link => link?.includes(story.id.replaceAll("-", "")) || link === `/historias/${story.slug}`))
    ?? stories.find(story => normalized === story.title.toLocaleLowerCase("es")
      || normalized === `${story.title} (${story.originalTitle})`.toLocaleLowerCase("es"));
}

export function sortByReadingGuide(stories: Story[], blocks: EditorialBlock[]): Story[] {
  const positions = new Map<string, number>();
  for (const block of blocks) {
    if (block.type !== "table") continue;
    for (const row of block.richRows.slice(block.hasHeader ? 1 : 0)) {
      for (const cell of row) {
        const story = storyForReadingCell(cell.map(part => part.text).join(""), cell.map(part => part.href), stories);
        if (story && !positions.has(story.id)) positions.set(story.id, positions.size);
      }
    }
  }
  return [...stories].sort((a, b) => (positions.get(a.id) ?? Infinity) - (positions.get(b.id) ?? Infinity));
}

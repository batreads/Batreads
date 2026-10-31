import type { Author, Story } from "./notion";

/** Show only an explicit editorial choice with a published story and a reason. */
export function authorStartingBook(
  author: Pick<Author, "startingStoryIds" | "startingReason">,
  stories: Story[],
) {
  const reason = author.startingReason.trim();
  if (author.startingStoryIds.length !== 1 || !reason) return null;
  const story = stories.find(story => story.id === author.startingStoryIds[0]);
  return story ? { story, reason } : null;
}

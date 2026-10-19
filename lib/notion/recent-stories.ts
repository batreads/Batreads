import type { Story } from "./types";

function publicationTime(story: Story): number {
  const time = story.batreadsPublishedAt ? Date.parse(story.batreadsPublishedAt) : NaN;
  return Number.isFinite(time) ? time : Number.NEGATIVE_INFINITY;
}

export function compareBatreadsPublication(a: Story, b: Story): number {
  const aTime = publicationTime(a);
  const bTime = publicationTime(b);
  if (aTime !== bTime) return aTime > bTime ? -1 : 1;
  return a.title.localeCompare(b.title, "es") || a.slug.localeCompare(b.slug);
}

export function recentStories(stories: Story[], limit: number): Story[] {
  return [...stories]
    .sort(compareBatreadsPublication)
    .slice(0, limit);
}

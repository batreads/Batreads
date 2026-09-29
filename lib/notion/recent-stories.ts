import type { Story } from "./types";

export function recentStories(stories: Story[], limit: number): Story[] {
  return [...stories]
    .sort((a, b) =>
      (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt)
      || b.createdAt.localeCompare(a.createdAt)
      || a.slug.localeCompare(b.slug),
    )
    .slice(0, limit);
}

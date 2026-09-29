import { getAuthors, getSagas, getStories, storiesForSeoPage, type SeoPage } from "@/lib/notion";

export async function coversForSeoPage(page: SeoPage): Promise<string[]> {
  const [stories, authors, sagas] = await Promise.all([getStories(), getAuthors(), getSagas()]);
  const related = storiesForSeoPage(page, stories, authors, sagas);
  const mainIds = new Set(page.mainStoryIds);
  return [...related.filter((story) => mainIds.has(story.id)), ...related.filter((story) => !mainIds.has(story.id))]
    .map((story) => story.coverUrl)
    .filter((cover): cover is string => Boolean(cover))
    .slice(0, 3);
}

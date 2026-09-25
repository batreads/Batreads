import { isNotionPage, notionRequest } from "./client";
import {
  isPublishedStoryPage,
  mapNotionPageToStory,
  notionSlugForWebSlug,
} from "./mapper";
import { getNotionPageTitle, validSlug } from "./properties";
import { queryPages } from "./query";
import type { Story } from "./types";

const publicationFilter = {
  and: [
    { property: "Publicación Batreads", select: { equals: "Publicar" } },
    { property: "Estado ficha", select: { equals: "Publicada" } },
  ],
};

export async function getStories(): Promise<Story[]> {
  return (await queryPages("HISTORIAS", publicationFilter))
    .filter(isPublishedStoryPage)
    .map(mapNotionPageToStory);
}

export async function getStoryBySlug(slug: string): Promise<Story | null> {
  if (!validSlug(slug)) return null;

  const notionSlug = notionSlugForWebSlug(slug);
  const pages = (await queryPages("HISTORIAS", {
      and: [...publicationFilter.and, { property: "Slug", rich_text: { equals: notionSlug } }],
  })).filter(isPublishedStoryPage);

  if (pages.length === 0) return null;
  if (pages.length > 1) throw new Error(`Slug duplicado en Notion: ${notionSlug}`);

  const story = mapNotionPageToStory(pages[0]);

  if (story.authorId) {
    const author = await notionRequest<unknown>(`/pages/${story.authorId}`);
    if (isNotionPage(author)) story.authorName = getNotionPageTitle(author);
  }

  return story;
}

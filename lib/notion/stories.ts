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
  const [pages, authors, sagas] = await Promise.all([
    queryPages("HISTORIAS", publicationFilter),
    queryPages("AUTORAS"),
    queryPages("SAGAS"),
  ]);
  const authorNames = new Map(authors.map((page) => [page.id, getNotionPageTitle(page)]));
  const sagaNames = new Map(sagas.map((page) => [page.id, getNotionPageTitle(page)]));

  return pages.filter(isPublishedStoryPage).map((page) => {
    const story = mapNotionPageToStory(page);
    story.authorName = story.authorId ? authorNames.get(story.authorId) ?? null : null;
    story.sagaName = story.sagaId ? sagaNames.get(story.sagaId) ?? null : null;
    return story;
  });
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

  const [author, saga] = await Promise.all([
    story.authorId ? notionRequest<unknown>(`/pages/${story.authorId}`) : null,
    story.sagaId ? notionRequest<unknown>(`/pages/${story.sagaId}`) : null,
  ]);
  if (isNotionPage(author)) story.authorName = getNotionPageTitle(author);
  if (isNotionPage(saga)) story.sagaName = getNotionPageTitle(saga);

  return story;
}

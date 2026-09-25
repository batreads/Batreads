import { getStoriesDataSourceId, isNotionPage, notionRequest } from "./client";
import {
  getNotionPageTitle,
  isPublishedStoryPage,
  mapNotionPageToStory,
  notionSlugForWebSlug,
} from "./mapper";
import type { Story } from "./types";

type NotionQueryResponse = {
  object: "list";
  results: unknown[];
  has_more: boolean;
  next_cursor: string | null;
};

const publicationFilter = {
  and: [
    { property: "Publicación Batreads", select: { equals: "Publicar" } },
    { property: "Estado ficha", select: { equals: "Publicada" } },
  ],
};

async function queryStories(body: Record<string, unknown>): Promise<NotionQueryResponse> {
  const result = await notionRequest<NotionQueryResponse>(
    `/data_sources/${getStoriesDataSourceId()}/query`,
    { method: "POST", body },
  );

  if (result.object !== "list" || !Array.isArray(result.results)) {
    throw new Error("Notion no devolvió una lista de historias válida.");
  }

  return result;
}

export async function getStories(): Promise<Story[]> {
  const stories: Story[] = [];
  let cursor: string | null = null;

  do {
    const response = await queryStories({
      page_size: 100,
      filter: publicationFilter,
      ...(cursor ? { start_cursor: cursor } : {}),
    });

    for (const result of response.results) {
      if (isNotionPage(result) && isPublishedStoryPage(result)) {
        stories.push(mapNotionPageToStory(result));
      }
    }

    cursor = response.has_more ? response.next_cursor : null;
  } while (cursor);

  return stories;
}

export async function getStoryBySlug(slug: string): Promise<Story | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;

  const notionSlug = notionSlugForWebSlug(slug);
  const response = await queryStories({
    page_size: 2,
    filter: {
      and: [...publicationFilter.and, { property: "Slug", rich_text: { equals: notionSlug } }],
    },
  });

  const pages = response.results.filter(isNotionPage).filter(isPublishedStoryPage);

  if (pages.length === 0) return null;
  if (pages.length > 1) throw new Error(`Slug duplicado en Notion: ${notionSlug}`);

  const story = mapNotionPageToStory(pages[0]);

  if (story.authorId) {
    const author = await notionRequest<unknown>(`/pages/${story.authorId}`);
    if (isNotionPage(author)) story.authorName = getNotionPageTitle(author);
  }

  return story;
}

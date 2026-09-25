import { relationIds, select, text, validSlug } from "./properties";
import { queryPages } from "./query";
import { getStories } from "./stories";
import type { NotionPage, Saga } from "./types";

export function mapSaga(page: NotionPage, storiesBySaga: Map<string, string[]>): Saga {
  const name = text(page, "Nombre");
  const slug = text(page, "Slug");
  if (!name || !validSlug(slug)) throw new Error(`Saga ${page.id} sin nombre o slug válido.`);
  const editoriallyReady = ["Lista", "Publicada"].includes(select(page, "Estado ficha") ?? "");

  return {
    id: page.id,
    slug,
    name,
    description: editoriallyReady ? text(page, "Descripción") : "",
    intro: editoriallyReady ? text(page, "SEO intro") : "",
    authorIds: relationIds(page, "Autora"),
    storyIds: storiesBySaga.get(page.id) ?? [],
    readingOrder: select(page, "Orden de lectura"),
  };
}

export async function getSagas(): Promise<Saga[]> {
  const [pages, stories] = await Promise.all([queryPages("SAGAS"), getStories()]);
  const storiesBySaga = new Map<string, string[]>();
  for (const story of stories) {
    if (story.sagaId) storiesBySaga.set(story.sagaId, [...(storiesBySaga.get(story.sagaId) ?? []), story.id]);
  }
  const publicSagaIds = new Set(stories.map((story) => story.sagaId));

  return pages
    .filter((page) => !page.archived && !page.in_trash)
    .filter((page) => select(page, "Estado ficha") === "Publicada" || publicSagaIds.has(page.id))
    .map((page) => mapSaga(page, storiesBySaga))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function getSagaBySlug(slug: string): Promise<Saga | null> {
  if (!validSlug(slug)) return null;
  return (await getSagas()).find((saga) => saga.slug === slug) ?? null;
}

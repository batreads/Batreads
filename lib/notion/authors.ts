import { relationIds, select, tags, text, url, validSlug } from "./properties";
import { queryPages } from "./query";
import { getStories } from "./stories";
import type { Author, NotionPage } from "./types";

function mapAuthor(page: NotionPage, storiesByAuthor: Map<string, string[]>): Author {
  const name = text(page, "Nombre");
  const slug = text(page, "Slug");
  if (!name || !validSlug(slug)) throw new Error(`Autora ${page.id} sin nombre o slug válido.`);
  const editoriallyReady = ["Lista", "Publicada"].includes(select(page, "Estado") ?? "");

  return {
    id: page.id,
    slug,
    name,
    bio: editoriallyReady ? text(page, "Bio corta") : "",
    intro: editoriallyReady ? text(page, "SEO intro") : "",
    country: select(page, "País autora") ? [select(page, "País autora")!] : tags(page, "País autora"),
    specialties: tags(page, "Especialidades"),
    website: url(page, "Web"),
    storyIds: storiesByAuthor.get(page.id) ?? [],
    sagaIds: relationIds(page, "Sagas"),
  };
}

export async function getAuthors(): Promise<Author[]> {
  const [pages, stories] = await Promise.all([queryPages("AUTORAS"), getStories()]);
  const storiesByAuthor = new Map<string, string[]>();
  for (const story of stories) {
    if (story.authorId) storiesByAuthor.set(story.authorId, [...(storiesByAuthor.get(story.authorId) ?? []), story.id]);
  }
  const publicAuthorIds = new Set(stories.map((story) => story.authorId));

  return pages
    .filter((page) => !page.archived && !page.in_trash)
    .filter((page) => select(page, "Estado") !== "Descartada")
    .filter((page) => select(page, "Estado") === "Publicada" || publicAuthorIds.has(page.id))
    .map((page) => mapAuthor(page, storiesByAuthor))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  if (!validSlug(slug)) return null;
  return (await getAuthors()).find((author) => author.slug === slug) ?? null;
}

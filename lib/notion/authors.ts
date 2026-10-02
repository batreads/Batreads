import { imageUrl, number, relationIds, select, tags, text, url, validSlug } from "./properties";
import { queryPages } from "./query";
import { getStories } from "./stories";
import type { Author, NotionPage } from "./types";

function mapAuthor(page: NotionPage): Author {
  const name = text(page, "Nombre");
  const slug = text(page, "Slug");
  if (!name || !validSlug(slug)) throw new Error(`Autora ${page.id} sin nombre o slug válido.`);
  return {
    id: page.id,
    slug,
    name,
    bio: text(page, "Bio corta"),
    intro: text(page, "SEO intro"),
    country: select(page, "País autora") ? [select(page, "País autora")!] : tags(page, "País autora"),
    specialties: tags(page, "Especialidades"),
    website: url(page, "Web"),
    photoUrl: imageUrl(page, "Foto"),
    publicationTypes: select(page, "Tipo publicación") ? [select(page, "Tipo publicación")!] : tags(page, "Tipo publicación"),
    storyCount: number(page, "N.º historias"),
    instagram: url(page, "Instagram"),
    tiktok: url(page, "TikTok"),
    wattpad: url(page, "Wattpad"),
    goodreads: url(page, "Goodreads"),
    amazonUrl: url(page, "Amazon Author"),
    verifiedAt: page.properties["Última verificación"]?.date?.start ?? null,
    updatedAt: page.last_edited_time ?? null,
    featuredCollectionId: relationIds(page, "Colección destacada")[0] ?? null,
    storyIds: relationIds(page, "Historias"),
    sagaIds: relationIds(page, "Sagas"),
  };
}

export async function getAuthors(): Promise<Author[]> {
  const [pages, stories] = await Promise.all([queryPages("AUTORAS"), getStories()]);
  const publicAuthorIds = new Set(stories.map((story) => story.authorId));

  return pages
    .filter((page) => !page.archived && !page.in_trash)
    .filter((page) => select(page, "Estado") !== "Descartada")
    .filter((page) => select(page, "Estado") === "Publicada" || publicAuthorIds.has(page.id))
    .map(mapAuthor)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  if (!validSlug(slug)) return null;
  return (await getAuthors()).find((author) => author.slug === slug) ?? null;
}

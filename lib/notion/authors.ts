import { imageUrl, number, relationIds, select, tags, text, url, validSlug } from "./properties";
import { queryPages } from "./query";
import type { Author, NotionPage } from "./types";

// These exact author records were public before publication became opt-in.
const previouslyPublishedAuthorIds = new Set([
  "3e70b771-a822-81d7-9c4e-c29b5d6c6239", // Clarissa Wild
  "3e60b771-a822-816a-b65c-e7d9e3122e0b", // Alba Gil Cabrera
  "3e30b771-a822-8104-921e-fa664b0915b4", // K.A. Knight
  "3e30b771-a822-811e-a3ea-d43804735d3d", // Abby Assou
  "3e30b771-a822-8122-aeaf-d1d79294f2d2", // Lucía Solla Sobral
  "3e30b771-a822-8191-9a44-fc452f863459", // Penelope Douglas
  "3e30b771-a822-8194-8a35-d6dbca576c5e", // Harley Laroux
  "3e30b771-a822-81c8-9415-f7525dd6969a", // Ana Coello
  "3e30b771-a822-81dc-ba18-ee056f439fa4", // L.M.R. Bello
]);

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
  const pages = await queryPages("AUTORAS");

  return pages
    .filter((page) => !page.archived && !page.in_trash)
    .filter((page) => {
      const status = select(page, "Estado");
      return status === "Publicada"
        || (status !== "Descartada" && previouslyPublishedAuthorIds.has(page.id));
    })
    .map(mapAuthor)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  if (!validSlug(slug)) return null;
  return (await getAuthors()).find((author) => author.slug === slug) ?? null;
}

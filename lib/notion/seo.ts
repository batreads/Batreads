import { checkbox, relationIds, select, text, validSlug } from "./properties";
import { queryPages } from "./query";
import type { Author, NotionPage, Saga, SeoPage, Story } from "./types";

export function mapSeoPage(page: NotionPage): SeoPage {
  const slug = text(page, "Slug");
  const title = text(page, "Título");
  if (!title || !validSlug(slug)) throw new Error(`Página SEO ${page.id} sin título o slug válido.`);

  const section = select(page, "Sección web") ?? "listas";
  const rawPath = text(page, "Ruta");
  const path = /^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(rawPath)
    ? rawPath
    : section === "listas" ? `/listas/${slug}` : `/${slug}`;

  return {
    id: page.id,
    slug,
    path,
    section,
    title: text(page, "SEO title") || title,
    heading: text(page, "H1") || title,
    description: text(page, "Meta description") || text(page, "Resumen / entradilla"),
    intro: text(page, "Introducción"),
    conclusion: text(page, "Conclusión"),
    cta: text(page, "CTA"),
    faqs: text(page, "FAQs"),
    indexable: checkbox(page, "Indexable"),
    dynamicCollection: checkbox(page, "Colección dinámica"),
    relatedStoryIds: relationIds(page, "Historias relacionadas"),
    mainStoryIds: relationIds(page, "Libro principal"),
    authorIds: relationIds(page, "Autora relacionada"),
    sagaIds: relationIds(page, "Saga relacionada"),
    filter1: {
      field: select(page, "Filtro 1 campo") ?? "",
      operator: select(page, "Filtro 1 operador") ?? "",
      value: text(page, "Filtro 1 valor"),
    },
    filter2: {
      field: select(page, "Filtro 2 campo") ?? "",
      operator: select(page, "Filtro 2 operador") ?? "",
      value: text(page, "Filtro 2 valor"),
    },
  };
}

export async function getSeoPages(): Promise<SeoPage[]> {
  const pages = await queryPages("SEO", { property: "Estado", select: { equals: "Publicado" } });
  return pages
    .filter((page) => !page.archived && !page.in_trash && select(page, "Estado") === "Publicado")
    .map(mapSeoPage);
}

export async function getSeoPageBySlug(slug: string): Promise<SeoPage | null> {
  if (!validSlug(slug)) return null;
  return (await getSeoPages()).find((page) => page.slug === slug) ?? null;
}

export async function getSeoPageByPath(path: string): Promise<SeoPage | null> {
  return (await getSeoPages()).find((page) => page.path === path) ?? null;
}

function matchesFilter(
  story: Story,
  filter: SeoPage["filter1"],
  authors: Author[],
  sagas: Saga[],
): boolean {
  if (!filter.field || !filter.value) return false;
  if (!(filter.field in story.filterValues)) return false;
  const relatedName = filter.field === "Autora"
    ? authors.find((author) => author.id === story.authorId)?.name
    : filter.field === "Saga"
      ? sagas.find((saga) => saga.id === story.sagaId)?.name
      : undefined;
  const values = [...story.filterValues[filter.field], ...(relatedName ? [relatedName] : [])]
    .map((value) => value.toLocaleLowerCase("es"));
  const expected = filter.value.toLocaleLowerCase("es");
  switch (filter.operator) {
    case "es": return values.includes(expected);
    case "contiene": return values.some((value) => value.includes(expected));
    case "no contiene": return values.every((value) => !value.includes(expected));
    case "mayor o igual": return values.some((value) => Number(value) >= Number(expected));
    case "menor o igual": return values.some((value) => Number(value) <= Number(expected));
    default: return false;
  }
}

export function storiesForSeoPage(page: SeoPage, stories: Story[], authors: Author[] = [], sagas: Saga[] = []): Story[] {
  const explicitIds = new Set([...page.relatedStoryIds, ...page.mainStoryIds]);
  return stories.filter((story) => {
    if (explicitIds.has(story.id)) return true;
    if (!page.dynamicCollection || !page.filter1.field) return false;
    return matchesFilter(story, page.filter1, authors, sagas)
      && (!page.filter2.field || matchesFilter(story, page.filter2, authors, sagas));
  });
}

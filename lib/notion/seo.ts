import { checkbox, number, relationIds, select, text, validSlug } from "./properties";
import { queryPages } from "./query";
import type { Author, NotionPage, Saga, SeoPage, Story } from "./types";

const listTemplates = new Set(["CollectionLanding", "BooksLikeLanding", "RankingLanding", "ReadingOrderLanding"]);
const priorityRanks: Record<string, number> = { Alta: 3, Media: 2, Baja: 1 };

export function mapSeoPage(page: NotionPage): SeoPage {
  const slug = text(page, "Slug");
  const title = text(page, "Título");
  if (!title || !validSlug(slug)) throw new Error(`Página SEO ${page.id} sin título o slug válido.`);

  const rawPath = text(page, "Ruta");
  const hasExplicitPath = /^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(rawPath);
  const selectedPageType = select(page, "Plantilla frontend") ?? select(page, "Tipo de página") ?? "";
  const pageType = selectedPageType === "Libros parecidos" ? "BooksLikeLanding" : selectedPageType;
  const section = select(page, "Sección web")
    ?? (hasExplicitPath && (rawPath.startsWith("/listas/") || listTemplates.has(pageType)) ? "listas" : "guias");
  const rawOrDefaultPath = hasExplicitPath ? rawPath : section === "listas" ? `/listas/${slug}` : `/${slug}`;
  const path = section === "listas" ? `/listas/${slug}` : rawOrDefaultPath;

  return {
    id: page.id,
    slug,
    path,
    legacyPath: rawOrDefaultPath !== path ? rawOrDefaultPath : null,
    hasExplicitPath,
    pageType,
    pageFormat: select(page, "Formato de página") ?? "",
    topic: select(page, "Entidad / tema") ?? "",
    priority: priorityRanks[select(page, "Prioridad SEO") ?? ""] ?? number(page, "Prioridad SEO"),
    publishedAt: page.properties["Fecha publicación"]?.date?.start ?? null,
    createdAt: page.created_time ?? "",
    section,
    title: text(page, "SEO title") || title,
    contentTitle: title,
    heading: text(page, "H1") || title,
    description: text(page, "Meta description") || text(page, "Resumen / entradilla"),
    summary: text(page, "Resumen / entradilla"),
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

export async function getLatestListPage(): Promise<SeoPage | null> {
  const pages = (await getSeoPages()).filter((page) => page.section === "listas");
  pages.sort((a, b) =>
    (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt)
    || b.createdAt.localeCompare(a.createdAt),
  );
  return pages[0] ?? null;
}

export async function getSeoPageBySlug(slug: string): Promise<SeoPage | null> {
  if (!validSlug(slug)) return null;
  return (await getSeoPages()).find((page) => page.slug === slug) ?? null;
}

export async function getSeoPageByPath(path: string): Promise<SeoPage | null> {
  const pages = await getSeoPages();
  return pages.find((page) => page.path === path)
    ?? pages.find((page) => page.legacyPath === path)
    ?? null;
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
  const isBooksLikePage = page.pageType === "BooksLikeLanding";
  const explicitIds = isBooksLikePage
    ? page.relatedStoryIds
    : [...page.relatedStoryIds, ...page.mainStoryIds];
  const explicitOrder = new Map(explicitIds.map((id, index) => [id, index]));
  const mainStoryIds = new Set(page.mainStoryIds);

  return stories.filter((story) => {
    if (isBooksLikePage && mainStoryIds.has(story.id)) return false;
    if (explicitOrder.has(story.id)) return true;
    if (!page.dynamicCollection || !page.filter1.field) return false;
    return matchesFilter(story, page.filter1, authors, sagas)
      && (!page.filter2.field || matchesFilter(story, page.filter2, authors, sagas));
  }).sort((a, b) => (explicitOrder.get(a.id) ?? Infinity) - (explicitOrder.get(b.id) ?? Infinity));
}

import { checkbox, number, relationIds, select, tags, text, url, validSlug } from "./properties";
import type { NotionPage, Story } from "./types";

const webSlugByNotionSlug: Record<string, string> = {
  "credence-penelope-douglas": "credence",
};

export function notionSlugForWebSlug(slug: string): string {
  const match = Object.entries(webSlugByNotionSlug).find(([, webSlug]) => webSlug === slug);
  return match?.[0] ?? slug;
}

function coverUrl(page: NotionPage): string | null {
  const raw = url(page, "Portada URL");
  if (!raw) return null;
  if (raw.startsWith("public/images/")) return `/${raw.slice("public/".length)}`;
  if (raw.startsWith("/images/")) return raw;
  if (/^https:\/\//.test(raw)) return raw;
  return null;
}

function filterValues(page: NotionPage): Record<string, string[]> {
  const fields = [
    "Subgénero", "Tropes", "KU España", "Relación", "Arquetipo LI",
    "Dinámicas de relación", "Popularidad", "Plataforma", "Autora", "Saga",
    "Sello editorial", "Darkness", "Spice", "Toxicity", "Violence",
    "Publicación Batreads",
  ];

  return Object.fromEntries(fields.map((name) => {
    const value = page.properties[name];
    if (!value) return [name, []];
    switch (value.type) {
      case "select": return [name, value.select ? [value.select.name] : []];
      case "multi_select": return [name, (value.multi_select ?? []).map((item) => item.name)];
      case "checkbox": return [name, [value.checkbox ? "Sí" : "No"]];
      case "number": return [name, typeof value.number === "number" ? [String(value.number)] : []];
      case "rich_text": return [name, [text(page, name)].filter(Boolean)];
      case "title": return [name, [text(page, name)].filter(Boolean)];
      case "relation": return [name, (value.relation ?? []).map((item) => item.id)];
      default: return [name, []];
    }
  }));
}

export function isPublishedStoryPage(page: NotionPage): boolean {
  return (
    !page.archived &&
    !page.in_trash &&
    select(page, "Publicación Batreads") === "Publicar" &&
    select(page, "Estado ficha") === "Publicada"
  );
}

export function mapNotionPageToStory(page: NotionPage): Story {
  const title = text(page, "Título");
  const notionSlug = text(page, "Slug");

  if (!title || !validSlug(notionSlug)) {
    throw new Error(`La historia ${page.id} no tiene título o slug válido.`);
  }

  return {
    id: page.id,
    slug: webSlugByNotionSlug[notionSlug] ?? notionSlug,
    notionSlug,
    title,
    authorId: relationIds(page, "Autora")[0] ?? null,
    authorName: null,
    sagaId: relationIds(page, "Saga")[0] ?? null,
    relatedStoryIds: [
      ...relationIds(page, "Parecidos a"),
      ...relationIds(page, "Siguiente libro"),
      ...relationIds(page, "Leer antes"),
    ],
    filterValues: filterValues(page),
    coverUrl: coverUrl(page),
    hook: text(page, "Hook"),
    synopsis: text(page, "Sinopsis corta"),
    review: text(page, "Reseña"),
    idealFor: text(page, "Ideal para"),
    avoidIf: text(page, "Evita si"),
    warningContext: text(page, "Contexto warnings"),
    warnings: tags(page, "Warnings"),
    subgenres: tags(page, "Subgénero"),
    tropes: tags(page, "Tropes"),
    relationshipTypes: tags(page, "Relación"),
    kuSpain: checkbox(page, "KU España"),
    relationshipDynamics: tags(page, "Dinámicas de relación"),
    loveInterestTraits: tags(page, "Rasgos LI"),
    rating: number(page, "Nota global"),
    darkness: number(page, "Darkness"),
    spice: number(page, "Spice"),
    toxicity: number(page, "Toxicity"),
    violence: number(page, "Violence"),
    impact: number(page, "Impacto / WTF"),
    plot: number(page, "Trama"),
    writing: number(page, "Escritura"),
    characters: number(page, "Personajes"),
    romance: number(page, "Romance"),
    originality: number(page, "Originalidad"),
    originalYear: number(page, "Año original"),
    pageCount: number(page, "Páginas papel"),
    format: tags(page, "Formatos"),
    publisher: text(page, "Editorial española"),
    amazonUrl: url(page, "Amazon URL"),
    officialUrl: url(page, "URL principal"),
  };
}

import type { NotionPage, NotionProperty, NotionRichText, Story } from "./types";

const webSlugByNotionSlug: Record<string, string> = {
  "credence-penelope-douglas": "credence",
};

export function notionSlugForWebSlug(slug: string): string {
  const match = Object.entries(webSlugByNotionSlug).find(([, webSlug]) => webSlug === slug);
  return match?.[0] ?? slug;
}

function property(page: NotionPage, name: string): NotionProperty | undefined {
  return page.properties[name];
}

function joinText(parts: NotionRichText[] | undefined): string {
  return (parts ?? []).map((part) => part.plain_text ?? part.text?.content ?? "").join("").trim();
}

function text(page: NotionPage, name: string): string {
  const value = property(page, name);
  return value?.type === "title"
    ? joinText(value.title)
    : value?.type === "rich_text"
      ? joinText(value.rich_text)
      : "";
}

function select(page: NotionPage, name: string): string | null {
  const value = property(page, name);
  return value?.type === "select" ? value.select?.name ?? null : null;
}

function tags(page: NotionPage, name: string): string[] {
  const value = property(page, name);
  return value?.type === "multi_select"
    ? (value.multi_select ?? []).map((option) => option.name)
    : [];
}

function number(page: NotionPage, name: string): number | null {
  const value = property(page, name);
  return value?.type === "number" && typeof value.number === "number"
    ? value.number
    : null;
}

function url(page: NotionPage, name: string): string | null {
  const value = property(page, name);
  return value?.type === "url" ? value.url ?? null : null;
}

function coverUrl(page: NotionPage): string | null {
  const raw = url(page, "Portada URL");
  if (!raw) return null;
  if (raw.startsWith("public/images/")) return `/${raw.slice("public/".length)}`;
  if (raw.startsWith("/images/")) return raw;
  if (/^https:\/\//.test(raw)) return raw;
  return null;
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

  if (!title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(notionSlug)) {
    throw new Error(`La historia ${page.id} no tiene título o slug válido.`);
  }

  return {
    id: page.id,
    slug: webSlugByNotionSlug[notionSlug] ?? notionSlug,
    notionSlug,
    title,
    authorId: property(page, "Autora")?.relation?.[0]?.id ?? null,
    authorName: null,
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

export function getNotionPageTitle(page: NotionPage): string | null {
  const titleProperty = Object.values(page.properties).find((value) => value.type === "title");
  return titleProperty ? joinText(titleProperty.title) || null : null;
}

import type { Author, Saga, SeoPage } from "./notion/types";

export function brandedTitle(title: string): string {
  const value = title.trim();
  return /\bBatreads\b/i.test(value) ? value : `${value} · Batreads`;
}

export function authorDescription(author: Pick<Author, "name" | "intro" | "bio">): string {
  return author.intro || author.bio
    || `Conoce a ${author.name} en Batreads y descubre la información disponible sobre sus libros.`;
}

export function sagaDescription(saga: Pick<Saga, "name" | "metaDescription" | "intro" | "description">): string {
  return saga.metaDescription || saga.intro || saga.description
    || `Descubre la saga ${saga.name} en Batreads y consulta la información disponible sobre sus libros.`;
}

export function seoPageDescription(page: Pick<SeoPage, "description" | "intro" | "contentTitle">): string {
  if (page.description) return page.description;

  const intro = page.intro.replace(/<br\s*\/?>/gi, " ").replace(/\s+/g, " ").trim();
  if (intro) {
    const firstSentence = intro.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? intro;
    if (firstSentence.length <= 160) return firstSentence;
    const lastSpace = firstSentence.lastIndexOf(" ", 156);
    return `${firstSentence.slice(0, lastSpace > 0 ? lastSpace : 156).trimEnd()}…`;
  }

  return `Descubre ${page.contentTitle} en Batreads y encuentra recomendaciones de lectura.`;
}

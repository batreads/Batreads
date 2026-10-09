import { imageUrl, number, relationIds, select, text, validSlug } from "./properties";
import { queryPages } from "./query";
import { getStories } from "./stories";
import type { NotionPage, Saga } from "./types";

const verifiedBookTitles: Record<string, string[]> = {
  "universidad-spine-ridge": ["Sick Boys", "Evil Boys", "Vile Boys", "Boys Who Hunt", "Boys Who Taint", "Boys Who Crave"],
};

function bookTitles(value: string): string[] {
  return value.split(/\r?\n|<br\s*\/?>/i)
    .map((line) => line.trim().replace(/^\d+[.)]\s*/, ""))
    .filter(Boolean);
}

function parseFaqs(value: string): Saga["faqs"] {
  return value.split(/<br\s*\/?>(?:\s*<br\s*\/?>)+|\n\s*\n/i)
    .map((entry) => entry.replace(/<br\s*\/?>/gi, "\n").trim())
    .map((entry) => {
      const [question, ...answer] = entry.split("\n");
      return { question: question?.trim() ?? "", answer: answer.join(" ").trim() };
    })
    .filter(({ question, answer }) => Boolean(question && answer));
}

export function mapSaga(page: NotionPage, storiesBySaga: Map<string, string[]>): Saga {
  const name = text(page, "Nombre");
  const slug = text(page, "Slug");
  if (!name || !validSlug(slug)) throw new Error(`Saga ${page.id} sin nombre o slug válido.`);
  const configuredTitles = bookTitles(text(page, "Títulos en orden"));
  return {
    id: page.id,
    slug,
    name,
    h1: text(page, "H1"),
    summary: text(page, "Resumen / entradilla"),
    updatedAt: page.last_edited_time ?? null,
    description: text(page, "Descripción"),
    intro: text(page, "SEO intro"),
    authorIds: relationIds(page, "Autora"),
    storyIds: storiesBySaga.get(page.id) ?? [],
    readingOrder: select(page, "Orden de lectura"),
    originalTitle: text(page, "Título original"),
    sagaType: select(page, "Tipo de saga"),
    status: select(page, "Estado saga"),
    bookCount: number(page, "N.º libros"),
    bookTitles: configuredTitles.length > 0 ? configuredTitles : verifiedBookTitles[slug] ?? [],
    spanishAvailability: select(page, "Disponible en español"),
    kindleUnlimited: select(page, "Kindle Unlimited"),
    standalone: select(page, "¿Autoconclusivos?"),
    bookRelationship: select(page, "Relación entre libros"),
    whyReadInOrder: text(page, "Por qué leer en orden"),
    faqs: parseFaqs(text(page, "Preguntas frecuentes")),
    coverUrl: imageUrl(page, "Portada"),
    seoTitle: text(page, "SEO title").replace(/\\+\|/g, "|"),
    metaDescription: text(page, "Meta description"),
  };
}

export async function getSagas(): Promise<Saga[]> {
  const [pages, stories] = await Promise.all([queryPages("SAGAS"), getStories()]);
  const storiesBySaga = new Map<string, string[]>();
  for (const story of stories) {
    if (story.sagaId) storiesBySaga.set(story.sagaId, [...(storiesBySaga.get(story.sagaId) ?? []), story.id]);
  }
  return pages
    .filter((page) => !page.archived && !page.in_trash)
    .filter((page) => select(page, "Estado ficha") === "Publicada")
    .map((page) => mapSaga(page, storiesBySaga))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function getSagaBySlug(slug: string): Promise<Saga | null> {
  if (!validSlug(slug)) return null;
  return (await getSagas()).find((saga) => saga.slug === slug) ?? null;
}

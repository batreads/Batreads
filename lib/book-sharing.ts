import { siteUrl } from "@/lib/site-url";

export type ShareBook = {
  id: string;
  slug: string;
  title: string;
  authorName?: string | null;
  rating?: number | null;
  spice?: number | null;
  tropes?: string[];
  subgenres?: string[];
  idealFor?: string | null;
};

export type BookShareSource = "reddit" | "whatsapp" | "copy";

export function getShareUrl(book: Pick<ShareBook, "slug">, source?: BookShareSource): string {
  const url = new URL(`/historias/${encodeURIComponent(book.slug)}`, siteUrl);
  if (source) {
    url.searchParams.set("utm_source", source);
    url.searchParams.set("utm_medium", "share");
    url.searchParams.set("utm_campaign", "book_share");
  }
  return url.toString();
}

export function generateBookShareText(book: ShareBook, platform: BookShareSource): string {
  const title = book.title.trim();
  const author = book.authorName?.trim();
  const url = getShareUrl(book, platform);
  const linkedTitle = platform === "reddit"
    ? `[${title.replace(/[\\\[\]]/g, "\\$&")}](${url})`
    : title;
  const heading = author ? `${linkedTitle} — ${author}` : linkedTitle;
  const details: string[] = [];

  if (typeof book.rating === "number" && Number.isFinite(book.rating)) {
    details.push(`⭐ ${book.rating}/5`);
  }
  if (typeof book.spice === "number" && Number.isFinite(book.spice)) {
    details.push(`🌶️ Spice: ${book.spice}/5`);
  }

  // The book hero already uses the first three tropes as its main themes.
  const topics = [...(book.tropes ?? []), ...(book.subgenres ?? [])]
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value, index, values) => values.findIndex((item) => item.toLocaleLowerCase("es") === value.toLocaleLowerCase("es")) === index)
    .slice(0, 3);
  if (topics.length) details.push(`Topics: ${topics.join(" · ")}`);

  const idealFor = book.idealFor?.trim();
  if (platform === "reddit") {
    return [heading, details.join("  \n"), idealFor ? `**Es para ti...**  \n${idealFor}` : null]
      .filter(Boolean)
      .join("\n\n");
  }

  return [heading, details.join("\n"), idealFor ? `Es para ti...\n${idealFor}` : null,
    `Sinopsis, avisos de contenido y dónde leer:\n${url}`]
    .filter(Boolean)
    .join("\n\n");
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

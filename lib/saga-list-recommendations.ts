import type { Author, SeoPage } from "./notion/types";

export type SagaStorySignal = {
  id: string;
  authorId: string | null;
  filterValues: Record<string, string[]>;
};

const normalize = (value: string) => value.trim().toLocaleLowerCase("es");

function matches(signal: SagaStorySignal, filter: SeoPage["filter1"], sagaName: string, authors: Author[]): boolean {
  if (!filter.field || !filter.value.trim()) return false;
  const relatedName = filter.field === "Saga" ? sagaName
    : filter.field === "Autora" ? authors.find((author) => author.id === signal.authorId)?.name : undefined;
  const values = [...(signal.filterValues[filter.field] ?? []), ...(relatedName ? [relatedName] : [])].map(normalize);
  if (values.length === 0) return false;
  const expected = normalize(filter.value);
  switch (filter.operator) {
    case "es": return values.includes(expected);
    case "contiene": return values.some((value) => value.includes(expected));
    case "no contiene": return values.every((value) => !value.includes(expected));
    case "mayor o igual": return values.some((value) => Number.isFinite(Number(value)) && Number(value) >= Number(expected));
    case "menor o igual": return values.some((value) => Number.isFinite(Number(value)) && Number(value) <= Number(expected));
    default: return false;
  }
}

export function sagaListRecommendations(
  pages: SeoPage[], signals: SagaStorySignal[], saga: { id: string; name: string }, authors: Author[],
): { pages: SeoPage[]; fallback: boolean } {
  const published = [...new Map(pages.filter((page) => page.section === "listas" && page.indexable)
    .map((page) => [page.id, page])).values()];
  const storyIds = new Set(signals.map((signal) => signal.id));
  const ranked = published.map((page) => {
    const direct = page.sagaIds.includes(saga.id)
      || [...page.relatedStoryIds, ...page.mainStoryIds].some((id) => storyIds.has(id));
    const filters = [page.filter1, page.filter2].filter((filter) => filter.field);
    const thematic = filters.some((filter) => ["Subgénero", "Tropes"].includes(filter.field)
      && ["es", "contiene"].includes(filter.operator) && filter.value.trim());
    const matchingFilters = signals.some((signal) => filters.length > 0
      && filters.every((filter) => matches(signal, filter, saga.name, authors)));
    return { page, rank: direct ? 2 : matchingFilters && (thematic || page.dynamicCollection) ? 1 : 0 };
  }).filter(({ rank }) => rank > 0)
    .sort((a, b) => b.rank - a.rank || a.page.path.localeCompare(b.page.path, "es"));
  if (ranked.length > 0) return { pages: ranked.slice(0, 3).map(({ page }) => page), fallback: false };
  return {
    pages: published.sort((a, b) => (b.publishedAt || b.createdAt).localeCompare(a.publishedAt || a.createdAt)
      || b.createdAt.localeCompare(a.createdAt) || a.path.localeCompare(b.path, "es")).slice(0, 3),
    fallback: true,
  };
}

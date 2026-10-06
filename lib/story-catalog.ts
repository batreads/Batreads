import { getMood, moodFilters } from "@/lib/moods";
import type { Story } from "@/lib/notion";

export const STORIES_PER_PAGE = 10;

export type FilterKey = "subgenre" | "tropes" | "relationship" | "rhythm" | "rating" | "dark" | "spicy" | "toxicity" | "violence" | "plot";
export type SortKey = "recommended" | "rating" | "dark" | "spicy" | "title";
export type FilterDefinition = { key: FilterKey; label: string; options: string[] };

export const filterKeys: FilterKey[] = ["subgenre", "tropes", "relationship", "rhythm", "rating", "dark", "spicy", "toxicity", "violence", "plot"];
export const ratingOptions = ["3", "3.5", "4", "4.5"];
export const sortLabels: Record<SortKey, string> = {
  recommended: "Recomendadas",
  rating: "Mejor valoradas",
  dark: "Más oscuras",
  spicy: "Más spicy",
  title: "Título A–Z",
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
}

function textOptions(stories: Story[], field: "subgenres" | "tropes" | "relationshipTypes") {
  return [...new Set(stories.flatMap((story) => story[field]).map((value) => value.trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "es"));
}

function rhythmOptions(stories: Story[]) {
  return [...new Set(stories.flatMap((story) => story.filterValues["Ritmo"] ?? []))]
    .sort((a, b) => a.localeCompare(b, "es"));
}

function levelOptions(stories: Story[], field: "darkness" | "spice" | "toxicity" | "violence" | "plot") {
  return [...new Set(stories.map((story) => story[field]).filter((value): value is number =>
    value !== null && Number.isInteger(value) && value >= 1 && value <= 5))]
    .sort((a, b) => a - b)
    .map(String);
}

export function getFilterDefinitions(stories: Story[]): FilterDefinition[] {
  return [
    { key: "subgenre", label: "Subgénero", options: textOptions(stories, "subgenres") },
    { key: "tropes", label: "Tropes", options: textOptions(stories, "tropes") },
    { key: "relationship", label: "Relación", options: textOptions(stories, "relationshipTypes") },
    { key: "rhythm", label: "Ritmo", options: rhythmOptions(stories) },
    { key: "rating", label: "Valoración", options: ratingOptions },
    { key: "dark", label: "Dark", options: levelOptions(stories, "darkness") },
    { key: "spicy", label: "Spicy", options: levelOptions(stories, "spice") },
    { key: "toxicity", label: "Toxicidad", options: levelOptions(stories, "toxicity") },
    { key: "violence", label: "Violencia", options: levelOptions(stories, "violence") },
    { key: "plot", label: "Trama", options: levelOptions(stories, "plot") },
  ];
}

export function selectedFilters(definitions: FilterDefinition[], searchParams: URLSearchParams) {
  const mood = getMood(searchParams.get("mood") ?? undefined);
  return Object.fromEntries(definitions.map(({ key, options }) => [
    key, [...new Set([...(mood ? moodFilters[mood.slug][key] ?? [] : []), ...searchParams.getAll(key)])]
      .filter((value) => options.includes(value) || Boolean(mood && moodFilters[mood.slug][key]?.includes(value))),
  ])) as Record<FilterKey, string[]>;
}

export function matchesGroup(story: Story, key: FilterKey, values: string[]) {
  if (values.length === 0) return true;
  switch (key) {
    case "subgenre": return values.some((value) => story.subgenres.includes(value));
    case "tropes": return values.some((value) => story.tropes.includes(value));
    case "relationship": return values.some((value) => story.relationshipTypes.includes(value));
    case "rhythm": return values.some((value) => (story.filterValues["Ritmo"] ?? []).includes(value));
    case "rating": return story.rating !== null && values.some((value) => story.rating! >= Number(value));
    case "dark": return story.darkness !== null && values.some((value) => story.darkness === Number(value));
    case "spicy": return story.spice !== null && values.some((value) => story.spice === Number(value));
    case "toxicity": return story.toxicity !== null && values.some((value) => story.toxicity === Number(value));
    case "violence": return story.violence !== null && values.some((value) => story.violence === Number(value));
    case "plot": return story.plot !== null && values.some((value) => story.plot === Number(value));
  }
}

export function sortStories(stories: Story[], sort: SortKey) {
  if (sort === "recommended") return stories;
  return [...stories].sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title, "es");
    const field = sort === "rating" ? "rating" : sort === "dark" ? "darkness" : "spice";
    const aValue = a[field];
    const bValue = b[field];
    if (aValue === null && bValue !== null) return 1;
    if (aValue !== null && bValue === null) return -1;
    return (bValue ?? 0) - (aValue ?? 0) || a.title.localeCompare(b.title, "es");
  });
}

export function catalogResults(stories: Story[], searchParams: URLSearchParams) {
  const definitions = getFilterDefinitions(stories);
  const selected = selectedFilters(definitions, searchParams);
  const mood = getMood(searchParams.get("mood") ?? undefined);
  const trope = searchParams.get("trope")?.trim() || null;
  const sortParam = searchParams.get("sort");
  const sort: SortKey = sortParam && sortParam in sortLabels ? sortParam as SortKey : "recommended";
  const filteredStories = sortStories(stories.filter((story) =>
    (!trope || normalize(trope) === "dark romance" || story.tropes.some((item) => normalize(item).includes(normalize(trope))))
    && filterKeys.every((key) => matchesGroup(story, key, selected[key]))
  ), sort);
  const pageCount = Math.max(1, Math.ceil(filteredStories.length / STORIES_PER_PAGE));
  const requestedPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), pageCount) : 1;
  const start = (page - 1) * STORIES_PER_PAGE;

  return {
    definitions,
    selected,
    moodLabel: mood?.label ?? null,
    hasMood: Boolean(mood),
    trope,
    sort,
    total: filteredStories.length,
    page,
    pageCount,
    stories: filteredStories.slice(start, start + STORIES_PER_PAGE),
  };
}

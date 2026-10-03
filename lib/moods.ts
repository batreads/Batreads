import type { Story } from "@/lib/notion";

export const moods = [
  { slug: "spice", label: "Quiero mucho spice" },
  { slug: "oscuro", label: "Algo muy oscuro" },
  { slug: "thriller", label: "Romance + thriller" },
  { slug: "enemies-to-lovers", label: "De enemigos a amantes" },
  { slug: "reverse-harem", label: "Reverse harem" },
  { slug: "toxicas", label: "Relaciones tóxicas" },
  { slug: "trama", label: "Buena trama" },
  { slug: "adictivo", label: "Ritmo rápido" },
] as const;

export type Mood = (typeof moods)[number];
export type MoodFilterKey = "subgenre" | "tropes" | "relationship" | "rhythm" | "rating" | "dark" | "spicy" | "toxicity" | "violence" | "plot";

export const moodFilters: Record<Mood["slug"], Partial<Record<MoodFilterKey, string[]>>> = {
  spice: { spicy: ["4", "5"] },
  oscuro: { dark: ["4", "5"] },
  thriller: { subgenre: ["Thriller", "Suspense", "Romantic Suspense"] },
  "enemies-to-lovers": { tropes: ["De enemigos a amantes · Enemies to Lovers"] },
  "reverse-harem": { relationship: ["Relación múltiple · Why Choose"] },
  toxicas: { toxicity: ["4", "5"] },
  trama: { plot: ["4", "5"] },
  adictivo: { rhythm: ["Rápido"] },
};

export function matchesMood(story: Story, mood: Mood): boolean {
  return Object.entries(moodFilters[mood.slug]).every(([key, values]) => {
    if (!values?.length) return false;
    switch (key as MoodFilterKey) {
      case "subgenre": return values.some((value) => story.subgenres.includes(value));
      case "tropes": return values.some((value) => story.tropes.includes(value));
      case "relationship": return values.some((value) => story.relationshipTypes.includes(value));
      case "rhythm": return values.some((value) => (story.filterValues["Ritmo"] ?? []).includes(value));
      case "dark": return story.darkness !== null && values.includes(String(story.darkness));
      case "spicy": return story.spice !== null && values.includes(String(story.spice));
      case "toxicity": return story.toxicity !== null && values.includes(String(story.toxicity));
      case "violence": return story.violence !== null && values.includes(String(story.violence));
      case "plot": return story.plot !== null && values.includes(String(story.plot));
      case "rating": return story.rating !== null && values.some((value) => story.rating! >= Number(value));
    }
  });
}

export function getMood(slug: string | undefined): Mood | undefined {
  return moods.find((mood) => mood.slug === (slug === "taboo" ? "enemies-to-lovers" : slug));
}

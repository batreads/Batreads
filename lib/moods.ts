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
  thriller: { plot: ["3", "4", "5"], violence: ["3", "4", "5"] },
  "enemies-to-lovers": { tropes: ["Enemies to Lovers"] },
  "reverse-harem": { relationship: ["Why Choose"] },
  toxicas: { toxicity: ["4", "5"] },
  trama: { plot: ["4", "5"] },
  adictivo: { rhythm: ["Rápido"] },
};

export function getMood(slug: string | undefined): Mood | undefined {
  return moods.find((mood) => mood.slug === (slug === "taboo" ? "enemies-to-lovers" : slug));
}

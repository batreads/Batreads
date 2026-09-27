import type { Story } from "./notion/types";

export const moods = [
  { slug: "spice", label: "Quiero mucho spice" },
  { slug: "oscuro", label: "Algo muy oscuro" },
  { slug: "thriller", label: "Romance + thriller" },
  { slug: "taboo", label: "Quiero algo taboo" },
  { slug: "reverse-harem", label: "Reverse harem" },
  { slug: "toxicas", label: "Relaciones tóxicas" },
  { slug: "trama", label: "Más trama que spice" },
  { slug: "adictivo", label: "Fácil y adictivo" },
] as const;

export type Mood = (typeof moods)[number];

export function getMood(slug: string | undefined): Mood | undefined {
  return moods.find((mood) => mood.slug === slug);
}

export function matchesMood(story: Story, mood: Mood): boolean {
  switch (mood.slug) {
    case "spice": return (story.spice ?? 0) >= 4;
    case "oscuro": return (story.darkness ?? 0) >= 4;
    case "thriller": return (story.plot ?? 0) >= 3 && (story.violence ?? 0) >= 3;
    case "taboo": return story.tropes.some((trope) => /taboo|forbidden/i.test(trope))
      || ((story.darkness ?? 0) >= 4 && story.tropes.includes("Age Gap"));
    case "reverse-harem": return story.relationshipTypes.some((type) => /why choose|poly|reverse harem/i.test(type));
    case "toxicas": return (story.toxicity ?? 0) >= 4;
    case "trama": return (story.plot ?? 0) > (story.spice ?? 0);
    case "adictivo": return story.pageCount !== null && story.pageCount <= 450 && (story.plot ?? 0) >= 3;
  }
}

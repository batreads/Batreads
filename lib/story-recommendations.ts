import type { Story } from "./notion/types";

export const recommendationFields = [
  "Siguiente libro", "Leer antes", "Parecidos a", "Más spicy",
  "Más oscuro", "Menos oscuro", "Más extremo",
] as const;

export type RecommendationField = typeof recommendationFields[number];

export function storyRecommendations(story: Story, publishedStories: Story[]) {
  const byId = new Map(publishedStories.map((item) => [item.id, item]));
  return recommendationFields.map((label) => ({
    label,
    stories: [...new Set(story.recommendationIds?.[label] ?? [])]
      .filter((id) => id !== story.id)
      .flatMap((id) => byId.has(id) ? [byId.get(id)!] : []),
  })).filter((group) => group.stories.length > 0);
}

import type { Story } from "./notion/types";

const indicators = [
  { key: "darkness", label: "Oscuridad", icon: "🌑" },
  { key: "spice", label: "Spice", icon: "🌶️" },
  { key: "toxicity", label: "Toxicidad", icon: "☠️" },
  { key: "violence", label: "Violencia", icon: "🔥" },
  { key: "impact", label: "WTF (trama)", icon: "🤯" },
] as const;

type Scores = Pick<Story, typeof indicators[number]["key"]>;

export function sagaDarkIndex(stories: Scores[]) {
  return indicators.map((indicator) => {
    const values = stories.map((story) => story[indicator.key])
      .filter((value): value is number => value !== null && Number.isFinite(value) && value >= 0 && value <= 5);
    return {
      ...indicator,
      count: values.length,
      average: values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : null,
    };
  });
}

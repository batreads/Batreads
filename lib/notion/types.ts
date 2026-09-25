export type NotionRichText = {
  plain_text?: string;
  text?: { content?: string };
};

export type NotionProperty = {
  type: string;
  title?: NotionRichText[];
  rich_text?: NotionRichText[];
  select?: { name: string } | null;
  multi_select?: { name: string }[];
  number?: number | null;
  url?: string | null;
  checkbox?: boolean;
  relation?: { id: string }[];
};

export type NotionPage = {
  object: "page";
  id: string;
  url: string;
  archived?: boolean;
  in_trash?: boolean;
  properties: Record<string, NotionProperty>;
};

export type Story = {
  id: string;
  slug: string;
  notionSlug: string;
  title: string;
  authorId: string | null;
  authorName: string | null;
  sagaId: string | null;
  relatedStoryIds: string[];
  filterValues: Record<string, string[]>;
  coverUrl: string | null;
  hook: string;
  synopsis: string;
  review: string;
  idealFor: string;
  avoidIf: string;
  warningContext: string;
  warnings: string[];
  subgenres: string[];
  tropes: string[];
  relationshipTypes: string[];
  kuSpain: boolean;
  relationshipDynamics: string[];
  loveInterestTraits: string[];
  rating: number | null;
  darkness: number | null;
  spice: number | null;
  toxicity: number | null;
  violence: number | null;
  impact: number | null;
  plot: number | null;
  writing: number | null;
  characters: number | null;
  romance: number | null;
  originality: number | null;
  originalYear: number | null;
  pageCount: number | null;
  format: string[];
  publisher: string;
  amazonUrl: string | null;
  officialUrl: string | null;
};

export type Author = {
  id: string;
  slug: string;
  name: string;
  bio: string;
  intro: string;
  country: string[];
  specialties: string[];
  website: string | null;
  storyIds: string[];
  sagaIds: string[];
};

export type Saga = {
  id: string;
  slug: string;
  name: string;
  description: string;
  intro: string;
  authorIds: string[];
  storyIds: string[];
  readingOrder: string | null;
};

export type SeoPage = {
  id: string;
  slug: string;
  path: string;
  section: string;
  title: string;
  heading: string;
  description: string;
  intro: string;
  conclusion: string;
  cta: string;
  faqs: string;
  indexable: boolean;
  dynamicCollection: boolean;
  relatedStoryIds: string[];
  mainStoryIds: string[];
  authorIds: string[];
  sagaIds: string[];
  filter1: { field: string; operator: string; value: string };
  filter2: { field: string; operator: string; value: string };
};

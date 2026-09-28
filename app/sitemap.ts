import type { MetadataRoute } from "next";
import { getAuthors, getSagas, getSeoPages, getStories } from "@/lib/notion";
import { siteUrl } from "@/lib/site-url";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteOrigin = siteUrl.origin;
  const [stories, authors, sagas, seoPages] = await Promise.all([
    getStories(),
    getAuthors(),
    getSagas(),
    getSeoPages(),
  ]);

  const paths = [
    "/",
    "/historias",
    "/autoras",
    "/sagas",
    "/listas",
    ...stories.map((story) => `/historias/${story.slug}`),
    ...authors.map((author) => `/autoras/${author.slug}`),
    ...sagas.map((saga) => `/sagas/${saga.slug}`),
  ];

  const entries = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const path of paths) {
    const url = new URL(path, siteOrigin).toString();
    entries.set(url, { url });
  }

  for (const page of seoPages.filter((page) => page.indexable)) {
    const url = new URL(page.path, siteOrigin).toString();
    if (!entries.has(url)) {
      entries.set(url, { url, ...(page.publishedAt ? { lastModified: page.publishedAt } : {}) });
    }
  }

  return [...entries.values()];
}

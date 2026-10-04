import type { MetadataRoute } from "next";
import { getAuthors, getSagas, getSeoPages, getStories } from "@/lib/notion";
import { siteUrl } from "@/lib/site-url";

// Build the XML on each request; Notion responses retain their hourly cache.
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteOrigin = siteUrl.origin;
  const [stories, authors, sagas, seoPages] = await Promise.all([
    getStories(),
    getAuthors(),
    getSagas(),
    getSeoPages(),
  ]);

  const staticPaths = [
    "/",
    "/historias",
    "/autoras",
    "/sagas",
    "/listas",
    "/apoya",
    "/condiciones-y-aviso-legal",
    "/politica-de-cookies",
  ];

  const entries = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const path of staticPaths) {
    const url = new URL(path, siteOrigin).toString();
    entries.set(url, { url });
  }

  for (const story of stories) {
    const url = new URL(`/historias/${story.slug}`, siteOrigin).toString();
    entries.set(url, { url, ...(story.updatedAt ? { lastModified: story.updatedAt } : {}) });
  }

  for (const author of authors) {
    const url = new URL(`/autoras/${author.slug}`, siteOrigin).toString();
    entries.set(url, { url, ...(author.updatedAt ? { lastModified: author.updatedAt } : {}) });
  }

  for (const saga of sagas) {
    const url = new URL(`/sagas/${saga.slug}`, siteOrigin).toString();
    entries.set(url, { url, ...(saga.updatedAt ? { lastModified: saga.updatedAt } : {}) });
  }

  for (const page of seoPages.filter((page) => page.indexable)) {
    const url = new URL(page.path, siteOrigin).toString();
    if (!entries.has(url)) {
      entries.set(url, { url, ...(page.updatedAt ? { lastModified: page.updatedAt } : {}) });
    }
  }

  return [...entries.values()];
}

import { isNotionPage, notionRequest } from "./client";
import type { NotionPage } from "./types";
import { cache } from "react";

type QueryResponse = {
  object: "list";
  results: unknown[];
  has_more: boolean;
  next_cursor: string | null;
};

export function dataSourceId(name: "HISTORIAS" | "AUTORAS" | "SAGAS" | "SEO"): string {
  const key = `NOTION_${name}_DATA_SOURCE_ID`;
  const id = process.env[key];
  if (!id || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error(`Falta ${key} o no es válido.`);
  }
  return id;
}

export function queryPages(
  source: "HISTORIAS" | "AUTORAS" | "SAGAS" | "SEO",
  filter?: Record<string, unknown>,
  sorts?: { property: string; direction: "ascending" | "descending" }[],
): Promise<NotionPage[]> {
  // Primitive keys deduplicate equivalent calls, even with freshly created filters.
  return queryPagesForRender(source, JSON.stringify(filter ?? null), JSON.stringify(sorts ?? null));
}

const queryPagesForRender = cache(async (
  source: "HISTORIAS" | "AUTORAS" | "SAGAS" | "SEO",
  filterKey: string,
  sortsKey: string,
): Promise<NotionPage[]> => {
  const filter = JSON.parse(filterKey) as Record<string, unknown> | null;
  const sorts = JSON.parse(sortsKey) as { property: string; direction: "ascending" | "descending" }[] | null;
  const pages: NotionPage[] = [];
  let cursor: string | null = null;

  do {
    const response: QueryResponse = await notionRequest<QueryResponse>(
      `/data_sources/${dataSourceId(source)}/query`,
      {
        method: "POST",
        body: { page_size: 100, ...(filter ? { filter } : {}), ...(sorts ? { sorts } : {}), ...(cursor ? { start_cursor: cursor } : {}) },
      },
    );
    if (response.object !== "list" || !Array.isArray(response.results)) {
      throw new Error(`Notion no devolvió una lista válida para ${source}.`);
    }
    pages.push(...response.results.filter(isNotionPage));
    if (response.has_more && !response.next_cursor) {
      throw new Error(`Notion no devolvió el cursor de ${source}.`);
    }
    cursor = response.has_more ? response.next_cursor : null;
  } while (cursor);

  return pages;
});

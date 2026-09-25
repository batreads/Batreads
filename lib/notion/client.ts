import type { NotionPage } from "./types";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2026-03-11";

export function getStoriesDataSourceId(): string {
  const id = process.env.NOTION_HISTORIAS_DATA_SOURCE_ID;

  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    throw new Error("Falta NOTION_HISTORIAS_DATA_SOURCE_ID o no es válido.");
  }

  return id;
}

export async function notionRequest<T>(
  path: string,
  options: { method?: "GET" | "POST"; body?: unknown } = {},
): Promise<T> {
  const token = process.env.NOTION_TOKEN;

  if (!token) {
    throw new Error("Falta NOTION_TOKEN para consultar Notion.");
  }

  const response = await fetch(`${NOTION_API}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`La API de Notion respondió ${response.status}.`);
  }

  return (await response.json()) as T;
}

export function isNotionPage(value: unknown): value is NotionPage {
  if (typeof value !== "object" || value === null) return false;

  const page = value as Partial<NotionPage>;
  return (
    page.object === "page" &&
    typeof page.id === "string" &&
    typeof page.properties === "object" &&
    page.properties !== null
  );
}

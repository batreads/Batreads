import type { NotionPage, NotionProperty, NotionRichText } from "./types";

export const validSlug = (value: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

export function property(page: NotionPage, name: string): NotionProperty | undefined {
  return page.properties[name];
}

export function joinText(parts: NotionRichText[] | undefined): string {
  return (parts ?? []).map((part) => part.plain_text ?? part.text?.content ?? "").join("").trim();
}

export function text(page: NotionPage, name: string): string {
  const value = property(page, name);
  return value?.type === "title" ? joinText(value.title)
    : value?.type === "rich_text" ? joinText(value.rich_text)
    : "";
}

export function select(page: NotionPage, name: string): string | null {
  const value = property(page, name);
  return value?.type === "select" ? value.select?.name ?? null : null;
}

export function tags(page: NotionPage, name: string): string[] {
  const value = property(page, name);
  return value?.type === "multi_select" ? (value.multi_select ?? []).map((item) => item.name) : [];
}

export function number(page: NotionPage, name: string): number | null {
  const value = property(page, name);
  return value?.type === "number" && typeof value.number === "number" ? value.number : null;
}

export function checkbox(page: NotionPage, name: string): boolean {
  const value = property(page, name);
  return value?.type === "checkbox" && value.checkbox === true;
}

export function url(page: NotionPage, name: string): string | null {
  const value = property(page, name);
  return value?.type === "url" ? value.url ?? null : null;
}

export function relationIds(page: NotionPage, name: string): string[] {
  const value = property(page, name);
  return value?.type === "relation" ? (value.relation ?? []).map((item) => item.id) : [];
}

export function getNotionPageTitle(page: NotionPage): string | null {
  const titleProperty = Object.values(page.properties).find((value) => value.type === "title");
  return titleProperty ? joinText(titleProperty.title) || null : null;
}

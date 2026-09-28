import { notionRequest } from "./client";
import { joinText } from "./properties";
import type { NotionRichText } from "./types";

type RawBlock = {
  id: string;
  type: string;
  paragraph?: { rich_text?: NotionRichText[] };
  callout?: { rich_text?: NotionRichText[] };
  heading_2?: { rich_text?: NotionRichText[] };
  heading_3?: { rich_text?: NotionRichText[] };
  bulleted_list_item?: { rich_text?: NotionRichText[] };
  numbered_list_item?: { rich_text?: NotionRichText[] };
  table?: { has_column_header?: boolean };
  table_row?: { cells?: NotionRichText[][] };
};

type BlockList = {
  object: "list";
  results: RawBlock[];
  has_more: boolean;
  next_cursor: string | null;
};

export type EditorialBlock =
  | { id: string; type: "paragraph" | "callout" | "heading_2" | "heading_3" | "bulleted_list_item" | "numbered_list_item"; text: string }
  | { id: string; type: "table"; rows: string[][]; hasHeader: boolean }
  | { id: string; type: "divider" };

async function blockChildren(id: string): Promise<RawBlock[]> {
  const blocks: RawBlock[] = [];
  let cursor: string | null = null;

  do {
    const query: string = cursor ? `?page_size=100&start_cursor=${encodeURIComponent(cursor)}` : "?page_size=100";
    const response: BlockList = await notionRequest<BlockList>(`/blocks/${id}/children${query}`);
    if (response.object !== "list" || !Array.isArray(response.results)) {
      throw new Error("Notion no devolvió los bloques de la página.");
    }
    blocks.push(...response.results);
    if (response.has_more && !response.next_cursor) {
      throw new Error("Notion no devolvió el cursor de los bloques.");
    }
    cursor = response.has_more ? response.next_cursor : null;
  } while (cursor);

  return blocks;
}

export async function getEditorialBlocks(pageId: string): Promise<EditorialBlock[]> {
  const blocks = await blockChildren(pageId);
  const mapped = await Promise.all(blocks.map(async (block): Promise<EditorialBlock | null> => {
    if (block.type === "divider") return { id: block.id, type: "divider" };
    if (block.type === "table") {
      const rows = (await blockChildren(block.id))
        .filter((row) => row.type === "table_row")
        .map((row) => (row.table_row?.cells ?? []).map(joinText));
      return { id: block.id, type: "table", rows, hasHeader: block.table?.has_column_header ?? false };
    }
    if (
      block.type === "paragraph" || block.type === "callout" || block.type === "heading_2" ||
      block.type === "heading_3" || block.type === "bulleted_list_item" || block.type === "numbered_list_item"
    ) {
      const text = joinText(block[block.type]?.rich_text);
      return text ? { id: block.id, type: block.type, text } : null;
    }
    return null;
  }));

  return mapped.filter((block): block is EditorialBlock => block !== null);
}

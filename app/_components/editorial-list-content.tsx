import type { ReactNode } from "react";
import { StoryGrid } from "./story-grid";
import type { EditorialBlock, Story } from "@/lib/notion";

type EditorialSection = { id: string; title: string | null; blocks: EditorialBlock[] };

function sectionsFromBlocks(blocks: EditorialBlock[]): EditorialSection[] {
  const sections: EditorialSection[] = [{ id: "intro", title: null, blocks: [] }];
  for (const block of blocks) {
    if (block.type === "heading_2") {
      sections.push({ id: block.id, title: block.text, blocks: [] });
    } else if (block.type === "divider") {
      sections.push({ id: block.id, title: "Para terminar", blocks: [] });
    } else {
      sections[sections.length - 1].blocks.push(block);
    }
  }
  return sections.filter((section) => section.blocks.length > 0);
}

function renderBlocks(blocks: EditorialBlock[]): ReactNode[] {
  const result: ReactNode[] = [];
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index];
    if (block.type === "bulleted_list_item" || block.type === "numbered_list_item") {
      const items: EditorialBlock[] = [];
      const type = block.type;
      while (blocks[index]?.type === type) items.push(blocks[index++]);
      const children = items.map((item) => {
        const text = "text" in item ? item.text : "";
        const labeled = text.match(/^([^:]{2,80}):\s+(.+)$/);
        return <li key={item.id}>{labeled ? <><strong>{labeled[1]}:</strong> {labeled[2]}</> : text}</li>;
      });
      result.push(type === "bulleted_list_item"
        ? <ul key={block.id}>{children}</ul>
        : <ol key={block.id}>{children}</ol>);
      continue;
    }
    if (block.type === "paragraph") result.push(<p key={block.id}>{block.text}</p>);
    if (block.type === "callout") result.push(<aside className="editorial-callout" key={block.id}>{block.text}</aside>);
    if (block.type === "heading_3") result.push(<h3 key={block.id}>{block.text}</h3>);
    if (block.type === "divider") result.push(<hr key={block.id} />);
    if (block.type === "table" && block.rows.length > 0) {
      const [firstRow, ...remainingRows] = block.rows;
      result.push(
        <div className="editorial-table-wrap" key={block.id}>
          <p className="editorial-table-hint">Desliza para ver la tabla →</p>
          <table>
            {block.hasHeader ? <thead><tr>{firstRow.map((cell, cellIndex) => <th scope="col" key={cellIndex}>{cell}</th>)}</tr></thead> : null}
            <tbody>{(block.hasHeader ? remainingRows : block.rows).map((row, rowIndex) => (
              <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
            ))}</tbody>
          </table>
        </div>,
      );
    }
    index += 1;
  }
  return result;
}

export function EditorialListContent({ blocks, stories, authorNames }: { blocks: EditorialBlock[]; stories: Story[]; authorNames: Record<string, string> }) {
  const sections = sectionsFromBlocks(blocks);
  const chooserIndex = sections.findIndex((section) => section.title?.startsWith("Encuentra el "));
  const gridAfter = chooserIndex >= 0 ? chooserIndex : 0;
  const books = stories.length > 0 ? (
    <section className="story-section seo-books-section home-story-cards" aria-labelledby="editorial-books-title">
      <h2 id="editorial-books-title">Libros recomendados</h2>
      <StoryGrid stories={stories} authorNames={authorNames} headingLevel={3} />
    </section>
  ) : null;

  return (
    <div className="editorial-list-content">
      {sections.map((section, index) => (
        <div key={section.id}>
          <section className={`story-section editorial-section${section.title ? "" : " seo-intro-section"}${section.title?.startsWith("Preguntas frecuentes") ? " editorial-faq-section" : ""}${index === chooserIndex ? " editorial-choice-section" : ""}${section.title?.startsWith("Libros de mafia romance") ? " editorial-metrics-section" : ""}`}>
            <h2>{section.title ?? "Introducción"}</h2>
            {renderBlocks(section.blocks)}
          </section>
          {index === gridAfter ? books : null}
        </div>
      ))}
      {sections.length === 0 ? books : null}
    </div>
  );
}

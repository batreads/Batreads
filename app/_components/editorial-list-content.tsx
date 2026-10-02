import type { ReactNode } from "react";
import { FaqList, type FaqItem } from "./faq-list";
import { StoryGrid } from "./story-grid";
import type { EditorialBlock, Story } from "@/lib/notion";

type EditorialSection = { id: string; title: string | null; blocks: EditorialBlock[] };
type TextBlock = Extract<EditorialBlock, { text: string }>;

function publicHref(href: string | null, notionPathsById: Record<string, string>): string | null {
  if (!href) return null;
  if (href.startsWith("/")) return href;
  try {
    const url = new URL(href);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.hostname === "notion.so" || url.hostname.endsWith(".notion.so") || url.hostname === "app.notion.com") {
      const id = url.pathname.match(/([a-f0-9]{32})(?:\/)?$/i)?.[1];
      return id ? notionPathsById[id.toLowerCase()] ?? null : null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function renderText(block: TextBlock, notionPathsById: Record<string, string>): ReactNode {
  return block.richText.map((part, index) => {
    let content: ReactNode = part.text;
    if (part.bold) content = <strong>{content}</strong>;
    if (part.italic) content = <em>{content}</em>;
    const href = publicHref(part.href, notionPathsById);
    return href ? <a href={href} key={index}>{content}</a> : <span key={index}>{content}</span>;
  });
}

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

function renderBlocks(blocks: EditorialBlock[], notionPathsById: Record<string, string>): ReactNode[] {
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
        return <li key={item.id}>{"richText" in item && item.richText.some((part) => part.href)
          ? renderText(item, notionPathsById)
          : labeled ? <><strong>{labeled[1]}:</strong> {labeled[2]}</> : text}</li>;
      });
      result.push(type === "bulleted_list_item"
        ? <ul key={block.id}>{children}</ul>
        : <ol key={block.id}>{children}</ol>);
      continue;
    }
    if (block.type === "paragraph") result.push(<p key={block.id}>{renderText(block, notionPathsById)}</p>);
    if (block.type === "callout") result.push(<aside className="editorial-callout" key={block.id}>{renderText(block, notionPathsById)}</aside>);
    if (block.type === "heading_3") result.push(<h3 key={block.id}>{renderText(block, notionPathsById)}</h3>);
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

function faqItemsFromBlocks(blocks: EditorialBlock[], notionPathsById: Record<string, string>): FaqItem[] {
  const items: FaqItem[] = [];
  for (const block of blocks) {
    if (block.type === "heading_3") {
      items.push({ question: block.text, answer: "" });
    } else if (block.type === "paragraph") {
      const answer = renderText(block, notionPathsById);
      const last = items[items.length - 1];
      if (last) last.answer = last.answer ? <>{last.answer} {answer}</> : answer;
      else items.push({ answer });
    }
  }
  return items;
}

export function EditorialListContent({ blocks, stories, authorNames, booksLike = false, notionPathsById = {} }: { blocks: EditorialBlock[]; stories: Story[]; authorNames: Record<string, string>; booksLike?: boolean; notionPathsById?: Record<string, string> }) {
  const visibleBlocks = booksLike ? blocks.filter((block) => block.type !== "callout" || !block.text.startsWith("Cómo elegimos estos libros.")) : blocks;
  const sections = sectionsFromBlocks(visibleBlocks);
  const chooserIndex = sections.findIndex((section) => section.title?.startsWith("Encuentra el "));
  const gridAfter = chooserIndex >= 0 ? chooserIndex : 0;
  const books = !booksLike && stories.length > 0 ? (
    <section className="story-section seo-books-section home-story-cards" aria-labelledby="editorial-books-title">
      <h2 id="editorial-books-title">Libros recomendados</h2>
      <StoryGrid stories={stories} authorNames={authorNames} headingLevel={3} />
    </section>
  ) : null;

  return (
    <div className="editorial-list-content">
      {sections.map((section, index) => {
        const sectionStory = booksLike ? stories.find((story) => section.title?.startsWith(`${story.title}:`)) : undefined;
        return <div key={section.id}>
          <section className={`story-section editorial-section${section.title ? "" : " seo-intro-section"}${section.title?.startsWith("Preguntas frecuentes") ? " editorial-faq-section" : ""}${index === chooserIndex ? " editorial-choice-section" : ""}${section.title?.startsWith("Libros de mafia romance") ? " editorial-metrics-section" : ""}`}>
            {section.title || !booksLike ? <h2>{section.title ?? "Introducción"}</h2> : null}
            {booksLike && section.title?.startsWith("Preguntas frecuentes")
              ? <FaqList items={faqItemsFromBlocks(section.blocks, notionPathsById)} />
              : renderBlocks(section.blocks, notionPathsById)}
            {sectionStory ? <div className="editorial-inline-story home-story-cards"><StoryGrid stories={[sectionStory]} authorNames={authorNames} headingLevel={3} /></div> : null}
          </section>
          {index === gridAfter ? books : null}
        </div>;
      })}
      {sections.length === 0 ? books : null}
    </div>
  );
}

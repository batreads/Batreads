import type { ReactNode } from "react";
import { FaqList, type FaqItem } from "./faq-list";
import { StoryGrid } from "./story-grid";
import { AuthorReadingTable } from "./author-reading-table";
import type { EditorialBlock, Story } from "@/lib/notion";

type EditorialSection = { id: string; title: string | null; blocks: EditorialBlock[] };
type TextBlock = Extract<EditorialBlock, { text: string }>;

function publicHref(href: string | null, notionPathsById: Record<string, string>): string | null {
  if (!href) return null;
  if (/^\/p\/[a-f0-9]{32}(?:[?#]|$)/i.test(href)) {
    const id = href.slice(3, 35).toLowerCase();
    return notionPathsById[id] ?? null;
  }
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

function renderText(block: Pick<TextBlock, "richText">, notionPathsById: Record<string, string>, titlesByPath: Record<string, string> = {}): ReactNode {
  return block.richText.map((part, index) => {
    const href = publicHref(part.href, notionPathsById);
    let content: ReactNode = href && part.text.trim() === "Untitled" ? titlesByPath[href] ?? part.text : part.text;
    if (part.bold) content = <strong>{content}</strong>;
    if (part.italic) content = <em>{content}</em>;
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

function renderBlocks(blocks: EditorialBlock[], notionPathsById: Record<string, string>, titlesByPath: Record<string, string>, stories: Story[] = [], authorReading = false): ReactNode[] {
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
    if (block.type === "heading_2") result.push(<h2 key={block.id}>{renderText(block, notionPathsById)}</h2>);
    if (block.type === "heading_3") result.push(<h3 key={block.id}>{renderText(block, notionPathsById)}</h3>);
    if (block.type === "divider") result.push(<hr key={block.id} />);
    if (block.type === "table" && block.rows.length > 0) {
      const [firstRow, ...remainingRows] = block.rows;
      result.push(
        <div className={authorReading ? "author-reading-table" : undefined} key={block.id}>
        {authorReading ? <AuthorReadingTable block={block} stories={stories} /> : null}
        <div className="editorial-table-wrap">
          <p className="editorial-table-hint">Desliza para ver la tabla →</p>
          <table>
            {block.hasHeader ? <thead><tr>{firstRow.map((cell, cellIndex) => <th scope="col" key={cellIndex}>{renderText({ richText: block.richRows[0][cellIndex] }, notionPathsById, titlesByPath)}</th>)}</tr></thead> : null}
            <tbody>{(block.hasHeader ? remainingRows : block.rows).map((row, rowIndex) => (
              <tr key={rowIndex}>{row.map((cell, cellIndex) => {
                const richText = block.richRows[rowIndex + (block.hasHeader ? 1 : 0)][cellIndex];
                const story = stories.find(story => richText.some(part => publicHref(part.href, notionPathsById) === `/historias/${story.slug}`));
                return <td key={cellIndex}>{story?.coverUrl ? <div className="editorial-table-book">
                  <a href={`/historias/${story.slug}`} tabIndex={-1} aria-hidden="true"><img src={story.coverUrl} alt="" width={44} height={66} loading="lazy" /></a>
                  <span>{renderText({ richText }, notionPathsById, titlesByPath)}</span>
                </div> : renderText({ richText }, notionPathsById, titlesByPath)}</td>;
              })}</tr>
            ))}</tbody>
          </table>
        </div>
        </div>,
      );
    }
    index += 1;
  }
  return result;
}

export function EditorialContent({ blocks, notionPathsById = {}, stories = [], authorReading = false }: { blocks: EditorialBlock[]; notionPathsById?: Record<string, string>; stories?: Story[]; authorReading?: boolean }) {
  return <>{renderBlocks(blocks, notionPathsById, {}, stories, authorReading)}</>;
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

function visibleEditorialSections(blocks: EditorialBlock[], booksLike: boolean) {
  return sectionsFromBlocks(booksLike
    ? blocks.filter((block) => block.type !== "callout" || !block.text.startsWith("Cómo elegimos estos libros."))
    : blocks);
}

export function editorialIndex(blocks: EditorialBlock[], booksLike = true, hasStories = false) {
  const sections = visibleEditorialSections(blocks, booksLike);
  const chooserIndex = sections.findIndex((section) => section.title?.startsWith("Encuentra el "));
  const gridAfter = chooserIndex >= 0 ? chooserIndex : 0;
  if (!sections.length && !booksLike && hasStories) return [{ id: "editorial-books-title", title: "Libros recomendados" }];
  return sections.flatMap((section, index) => [
    ...(section.title || !booksLike ? [{ id: `seccion-${section.id}`, title: section.title ?? "Introducción" }] : []),
    ...(!booksLike && hasStories && index === gridAfter ? [{ id: "editorial-books-title", title: "Libros recomendados" }] : []),
  ]);
}

export function EditorialListContent({ blocks, stories, authorNames, booksLike = false, notionPathsById = {} }: { blocks: EditorialBlock[]; stories: Story[]; authorNames: Record<string, string>; booksLike?: boolean; notionPathsById?: Record<string, string> }) {
  const sections = visibleEditorialSections(blocks, booksLike);
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
            {section.title || !booksLike ? <h2 id={section.title || !booksLike ? `seccion-${section.id}` : undefined}>{section.title ?? "Introducción"}</h2> : null}
            {section.title?.startsWith("Preguntas frecuentes")
              ? <FaqList items={faqItemsFromBlocks(section.blocks, notionPathsById)} />
              : renderBlocks(section.blocks, notionPathsById, Object.fromEntries(stories.map((story) => [`/historias/${story.slug}`, story.title])))}
            {sectionStory ? <div className="editorial-inline-story home-story-cards"><StoryGrid stories={[sectionStory]} authorNames={authorNames} headingLevel={3} showActions /></div> : null}
          </section>
          {index === gridAfter ? books : null}
        </div>;
      })}
      {sections.length === 0 ? books : null}
    </div>
  );
}

import type { EditorialBlock, Story } from "@/lib/notion";
import { storyForReadingCell } from "@/lib/author-reading-order";

export function AuthorReadingTable({ block, stories }: { block: Extract<EditorialBlock, { type: "table" }>; stories: Story[] }) {
  const headers = block.hasHeader ? block.rows[0] : [];
  const rows = block.richRows.slice(block.hasHeader ? 1 : 0);
  return <div className="author-reading-mobile">
    {rows.map((row, index) => {
      const cells = row.map(cell => cell.map(part => part.text).join(""));
      const titleIndex = Math.max(0, headers.findIndex(header => /título|libro/i.test(header)));
      const titleCell = row[titleIndex] ?? [];
      const story = storyForReadingCell(cells[titleIndex] ?? "", titleCell.map(part => part.href), stories);
      const heading = <>
          {titleIndex > 0 ? <span className="author-reading-number" aria-label={`Orden ${cells[0]}`}>{cells[0]}</span> : null}
          {story?.coverUrl ? <img src={story.coverUrl} alt="" width={44} height={66} loading="lazy" /> : null}
          <h4>{cells[titleIndex]}</h4>
      </>;
      return <article className="author-reading-book" key={`${block.id}-${index}`}>
        {cells.length > titleIndex + 1 ? <details>
          <summary className="author-reading-book-heading">
            {heading}
            <svg className="author-reading-chevron" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
          </summary>
          <div className="author-reading-notes">
          {cells.slice(titleIndex + 1).map((cell, offset) => <p key={offset}><strong>{headers[titleIndex + offset + 1] || "Notas"}: </strong>{cell}</p>)}
          {story ? <div className="author-reading-actions"><a href={`/historias/${story.slug}`}>Ver ficha de {story.title} →</a></div> : null}
          </div>
        </details> : <div className="author-reading-book-heading">{heading}</div>}
      </article>;
    })}
  </div>;
}

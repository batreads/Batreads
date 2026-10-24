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
      return <article className="author-reading-book" key={`${block.id}-${index}`}>
        <div className="author-reading-book-heading">
          {titleIndex > 0 ? <span className="author-reading-number" aria-label={`Orden ${cells[0]}`}>{cells[0]}</span> : null}
          {story?.coverUrl ? <img src={story.coverUrl} alt="" width={44} height={66} loading="lazy" /> : null}
          <h4>{story ? <a href={`/historias/${story.slug}`}>{cells[titleIndex]}</a> : cells[titleIndex]}</h4>
        </div>
        {cells.length > titleIndex + 1 ? <details open><summary>Notas de lectura <span aria-hidden="true">＋</span></summary>
          {cells.slice(titleIndex + 1).map((cell, offset) => <p key={offset}><strong>{headers[titleIndex + offset + 1] || "Notas"}: </strong>{cell}</p>)}
        </details> : null}
      </article>;
    })}
  </div>;
}

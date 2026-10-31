import Link from "next/link";
import type { Story } from "@/lib/notion";
import { EditorialImage } from "./editorial-image";
import "./author-starting-book.css";

export function AuthorStartingBook({ story, reason, authorName, bookCount }: {
  story: Story;
  reason: string;
  authorName: string;
  bookCount?: number | null;
}) {
  return <section className="story-section author-start" aria-labelledby="por-donde-empezar">
    <h2 id="por-donde-empezar">¿Por dónde empezar con {authorName}?</h2>
    <article className={`author-start-card${story.coverUrl ? "" : " author-start-no-cover"}`}>
      {story.coverUrl ? <EditorialImage className="author-start-cover" src={story.coverUrl}
        alt={`Portada de ${story.title}`} width={110} height={168}
        sizes="(max-width: 600px) 90px, 110px" loading="eager" /> : null}
      <div className="author-start-copy">
        {story.sagaName ? <p className="author-start-saga">{story.sagaName}{story.sagaNumber ? ` · Libro ${story.sagaNumber}${bookCount && bookCount >= story.sagaNumber ? ` de ${bookCount}` : ""}` : ""}</p> : null}
        <h3>{story.title}</h3>
        <p className="author-start-reason">{reason}</p>
        <Link className="author-start-link" href={`/historias/${story.slug}`}>Descubrir {story.title} <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  </section>;
}

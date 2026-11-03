"use client";

import Link from "next/link";
import { useId, useRef, type ReactNode } from "react";
import type { Story } from "@/lib/notion";
import { CarouselControls } from "./carousel-controls";
import { EditorialImage } from "./editorial-image";

export type ShelfBook = Pick<Story, "id" | "slug" | "title" | "coverUrl" | "authorName"> & { reasons?: string[]; tropes?: string[] };

export function BookShelf({ stories, label, heading, bookTitleAsHeading = false, nativeLazy = false }: {
  stories: ShelfBook[];
  label: string;
  heading?: ReactNode;
  bookTitleAsHeading?: boolean;
  nativeLazy?: boolean;
}) {
  const shelfRef = useRef<HTMLUListElement>(null);
  const id = useId();
  const Title = bookTitleAsHeading ? "h3" : "span";
  return (
    <div className="book-carousel" role="region" aria-roledescription="carrusel" aria-label={label}>
    <div className="book-carousel-toolbar">
      {heading}
      <div className="book-carousel-controls">
        {!heading && <span className="book-carousel-count">{stories.length} {stories.length === 1 ? "libro" : "libros"}</span>}
        <CarouselControls track={shelfRef} trackId={id} itemCount={stories.length}
          previousLabel={`Libros anteriores: ${label}`} nextLabel={`Más libros: ${label}`} />
      </div>
    </div>
    <ul className="book-shelf" id={id} ref={shelfRef} aria-label={label} tabIndex={0}>
      {stories.map((story) => (
        <li key={story.id}>
          <Link className="book-shelf-book" href={`/historias/${story.slug}`}>
            <span className="book-shelf-cover">
              {story.coverUrl ? <EditorialImage src={story.coverUrl} alt={`Portada de ${story.title}`}
                width={180} height={270} sizes="(max-width: 640px) 132px, 180px" loading="lazy" nativeLazy={nativeLazy} />
                : <span className="book-shelf-placeholder">{story.title}</span>}
            </span>
            <div className="book-shelf-copy">
            <Title className="book-shelf-title">{story.title}</Title>
            {story.authorName ? <span className="book-shelf-author">{story.authorName}</span> : null}
            {story.tropes?.length ? (
              <span className="book-shelf-trope">{story.tropes.join(" · ")}</span>
            ) : null}
            {story.reasons?.length ? <span className="book-shelf-reasons">
              {story.reasons.map((reason) => <span key={reason}>{reason}</span>)}
            </span> : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
    </div>
  );
}

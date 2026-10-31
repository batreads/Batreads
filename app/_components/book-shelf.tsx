"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { Story } from "@/lib/notion";
import { EditorialImage } from "./editorial-image";

export type ShelfBook = Pick<Story, "id" | "slug" | "title" | "coverUrl" | "authorName"> & { reasons?: string[] };

export function BookShelf({ stories, label }: {
  stories: ShelfBook[];
  label: string;
}) {
  const shelfRef = useRef<HTMLUListElement>(null);
  const id = useId();
  const [position, setPosition] = useState({ previous: false, next: false });
  useEffect(() => {
    const shelf = shelfRef.current;
    if (!shelf) return;
    const update = () => setPosition({
      previous: shelf.scrollLeft > 3,
      next: shelf.scrollLeft + shelf.clientWidth < shelf.scrollWidth - 3,
    });
    const observer = new ResizeObserver(update);
    observer.observe(shelf);
    shelf.addEventListener("scroll", update, { passive: true });
    update();
    return () => { observer.disconnect(); shelf.removeEventListener("scroll", update); };
  }, [stories]);
  function scroll(direction: number) {
    const shelf = shelfRef.current;
    shelf?.scrollBy({ left: direction * shelf.clientWidth * .8,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return (
    <div className="book-carousel" role="region" aria-roledescription="carrusel" aria-label={label}>
    <div className="book-carousel-toolbar">
      <div className="book-carousel-controls">
        <span className="book-carousel-count">{stories.length} {stories.length === 1 ? "libro" : "libros"}</span>
        <button type="button" aria-label={`Libros anteriores: ${label}`} aria-controls={id}
          disabled={!position.previous} onClick={() => scroll(-1)}>←</button>
        <button type="button" aria-label={`Más libros: ${label}`} aria-controls={id}
          disabled={!position.next} onClick={() => scroll(1)}>→</button>
      </div>
    </div>
    <ul className="book-shelf" id={id} ref={shelfRef} aria-label={label} tabIndex={0}>
      {stories.map((story) => (
        <li key={story.id}>
          <Link className="book-shelf-book" href={`/historias/${story.slug}`}>
            <span className="book-shelf-cover">
              {story.coverUrl ? <EditorialImage src={story.coverUrl} alt={`Portada de ${story.title}`}
                width={180} height={270} sizes="(max-width: 640px) 132px, 180px" loading="lazy" />
                : <span className="book-shelf-placeholder">{story.title}</span>}
            </span>
            <span className="book-shelf-copy">
            <span className="book-shelf-title">{story.title}</span>
            {story.authorName ? <span className="book-shelf-author">{story.authorName}</span> : null}
            {story.reasons?.length ? <span className="book-shelf-reasons">
              {story.reasons.map((reason) => <span key={reason}>{reason}</span>)}
            </span> : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
    </div>
  );
}

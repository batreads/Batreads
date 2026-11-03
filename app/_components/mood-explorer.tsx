"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useRef } from "react";
import { CarouselControls } from "./carousel-controls";
import type { Mood } from "@/lib/moods";

export function MoodExplorer({ moods }: { moods: Mood[] }) {
  const track = useRef<HTMLDivElement>(null);
  const trackId = useId();
  if (moods.length === 0) return null;

  return (
    <section className="home-moods" id="moods" aria-labelledby="home-moods-title">
      <div className="home-moods-inner">
        <p className="home-moods-eyebrow">Descubre Batreads</p>
        <div className="home-moods-heading">
          <h2 id="home-moods-title">¿Qué te apetece leer?</h2>
          <div className="book-carousel-controls">
            <CarouselControls track={track} trackId={trackId} itemCount={moods.length}
              previousLabel="Moods anteriores" nextLabel="Más moods" />
          </div>
        </div>
        <p className="home-moods-description">
          En Batreads compartimos libros de dark romance que hemos leído, con reseñas, tropes, nivel de spice
          y avisos de contenido. Elige un mood y encuentra tu próxima lectura.
        </p>
        <div className="home-moods-grid" id={trackId} ref={track} role="region" aria-label="Moods de lectura" tabIndex={0}>
          {moods.map(({ slug, label }) => (
            <Link className="home-mood-card" href={`/historias?mood=${slug}`} key={slug}>
              <span className="home-mood-card-media">
                <Image src={`/images/moods/${slug}.png`} alt="" fill sizes="(max-width: 640px) 144px, 160px" />
              </span>
              <span className="home-mood-card-title">{label}</span>
              <span className="home-mood-card-arrow" aria-hidden="true">
                <Image src="/icons/mood-arrow.svg" alt="" width={20} height={20} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

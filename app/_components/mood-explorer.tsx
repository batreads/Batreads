import Image from "next/image";
import Link from "next/link";
import { matchesMood, moods } from "@/lib/moods";
import type { Story } from "@/lib/notion";

export function MoodExplorer({ stories }: { stories: Story[] }) {
  const availableMoods = moods.filter((mood) => stories.some((story) => matchesMood(story, mood)));

  if (availableMoods.length === 0) return null;

  return (
    <section className="home-moods" aria-labelledby="home-moods-title">
      <div className="home-moods-inner">
        <p className="home-moods-eyebrow">Descubre Batreads</p>
        <h2 id="home-moods-title">¿Qué te apetece leer?</h2>
        <p className="home-moods-description">
          En Batreads compartimos libros de dark romance que hemos leído, con reseñas, tropes, nivel de spice
          y avisos de contenido. Elige un mood y encuentra tu próxima lectura.
        </p>
        <div className="home-moods-grid">
          {availableMoods.map(({ slug, label }) => (
            <Link className="home-mood-card" href={`/historias?mood=${slug}`} key={slug}>
              <span className="home-mood-card-media">
                <Image src={`/images/moods/${slug}.png`} alt="" fill sizes="(max-width: 600px) 50vw, (max-width: 1020px) 50vw, 25vw" />
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

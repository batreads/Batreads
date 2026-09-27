import Image from "next/image";
import Link from "next/link";
import { moods } from "@/lib/moods";

export function MoodExplorer() {
  return (
    <section className="home-moods" aria-labelledby="home-moods-title">
      <div className="home-moods-inner">
        <p className="home-moods-eyebrow">Explora a tu manera</p>
        <h2 id="home-moods-title">¿Qué te apetece leer?</h2>
        <p className="home-moods-description">Elige un mood y descubre historias que encajan contigo.</p>
        <div className="home-moods-grid">
          {moods.map(({ slug, label }) => (
            <Link className="home-mood-card" href={`/historias?mood=${slug}`} key={slug}>
              <Image src={`/images/moods/${slug}.png`} alt="" fill sizes="(max-width: 600px) 50vw, (max-width: 1020px) 50vw, 25vw" />
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

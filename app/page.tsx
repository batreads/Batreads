import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MoodExplorer } from "./_components/mood-explorer";
import { StoryGrid } from "./_components/story-grid";
import { getAuthors, getSeoPages, getStories } from "@/lib/notion";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const featuredSlugs = [
  "nido-de-viboras-ka-knight",
  "credence",
  "hunting-adeline",
  "five-brothers",
  "srta-mc-millan-abby-assou",
];

export default async function Home() {
  const [stories, authors, seoPages] = await Promise.all([getStories(), getAuthors(), getSeoPages()]);
  const featuredStories = [
    ...featuredSlugs.flatMap((slug) => stories.filter((story) => story.slug === slug)),
    ...stories.filter((story) => !featuredSlugs.includes(story.slug)),
  ].slice(0, 4);
  const authorNames = Object.fromEntries(authors.map((author) => [author.id, author.name]));
  const lists = seoPages
    .filter((page) => page.section === "listas")
    .sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt))
    .slice(0, 4);

  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <Image className="home-hero-background" src="/images/home-hero.png" alt="" fill priority sizes="100vw" />
        <div className="home-hero-content">
          <p className="home-hero-eyebrow">Dark romance · Romantasy · Lecturas intensas</p>
          <h1 id="home-hero-title">Tu próxima<br /><em>obsesión</em> empieza aquí.</h1>
          <p className="home-hero-description">
            Lecturas de dark romance que cuesta dejar.<br />{" "}
            Encuentra qué leer después.
          </p>
          <div className="home-hero-actions">
            <Link className="home-hero-action home-hero-action-primary" href="/historias">
              Explorar libros
              <Image src="/icons/hero-arrow-primary.svg" alt="" width={20} height={20} />
            </Link>
            <Link className="home-hero-action home-hero-action-secondary" href="/listas">
              Qué leer después
              <Image src="/icons/hero-arrow-secondary.svg" alt="" width={20} height={20} />
            </Link>
          </div>
        </div>
      </section>
      <MoodExplorer />
      <section className="home-recommendations" aria-labelledby="home-recommendations-title">
        <div className="home-recommendations-inner">
          <div className="home-recommendations-heading">
            <div>
              <p className="home-recommendations-eyebrow">Selección de libros</p>
              <h2 id="home-recommendations-title">Últimas lecturas</h2>
              <p className="home-recommendations-description">
                Lo último que hemos leído: cuatro historias intensas y oscuras,
                de esas que se leen con la puerta cerrada y cuesta olvidar.
              </p>
            </div>
            <Link className="home-section-more" href="/historias">
              Ver más libros <span aria-hidden="true">→</span>
            </Link>
          </div>
          <StoryGrid stories={featuredStories} authorNames={authorNames} headingLevel={3} />
        </div>
      </section>
      <section className="home-lists" aria-labelledby="home-lists-title">
        <div className="home-lists-inner">
          <div className="home-lists-heading">
            <div>
              <h2 id="home-lists-title">Listas Batreads</h2>
              <p>Cuando quieres una recomendación más concreta.</p>
            </div>
            <Link className="home-section-more" href="/listas">
              Todas las listas <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="home-lists-grid">
            {lists.map((page) => (
              <Link className="home-list-card" href={page.path} key={page.id}>
                <span className="home-list-card-label">Selección editorial</span>
                <h3>{page.heading}</h3>
                {page.description ? <p>{page.description}</p> : null}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="home-newsletter" aria-labelledby="home-newsletter-title">
        <div className="home-newsletter-panel">
          <p className="home-newsletter-eyebrow">Newsletter Batreads</p>
          <h2 id="home-newsletter-title">Tu dosis mensual de historias cuestionables.</h2>
          <p className="home-newsletter-description">
            Nuevos dark romance, hidden gems y recomendaciones seleccionadas en español.
          </p>
          <div className="home-newsletter-signup" aria-describedby="home-newsletter-status">
            <div className="home-newsletter-field">
              <input type="email" aria-label="Tu correo electrónico" placeholder="tu@email.com" disabled />
              <button type="button" aria-label="Suscripciones próximamente" disabled>→</button>
            </div>
            <label className="home-newsletter-consent">
              <input type="checkbox" disabled />
              <span>Acepto recibir historias por email (y algún desvelo).</span>
            </label>
            <p id="home-newsletter-status" className="home-newsletter-status">Suscripciones próximamente.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

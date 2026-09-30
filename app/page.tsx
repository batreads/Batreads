import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MoodExplorer } from "./_components/mood-explorer";
import { StoryGrid } from "./_components/story-grid";
import { getAuthors, getSeoPages, getStories } from "@/lib/notion";
import { recentStories } from "@/lib/notion/recent-stories";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [stories, authors, seoPages] = await Promise.all([getStories(), getAuthors(), getSeoPages()]);
  const latestStories = recentStories(stories, 6);
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
      <section className="home-recommendations home-story-cards" aria-labelledby="home-recommendations-title">
        <div className="home-recommendations-inner">
          <div className="home-recommendations-heading">
            <div>
              <p className="home-recommendations-eyebrow">Selección de libros</p>
              <h2 id="home-recommendations-title">Últimas lecturas</h2>
              <p className="home-recommendations-description">
                Lo último que hemos leído: historias intensas y oscuras,
                de esas que se leen con la puerta cerrada y cuesta olvidar.
              </p>
            </div>
            <Link className="home-section-more" href="/historias">
              Ver más libros <span aria-hidden="true">→</span>
            </Link>
          </div>
          <StoryGrid stories={latestStories} authorNames={authorNames} headingLevel={3} />
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
    </main>
  );
}

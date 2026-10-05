import type { Metadata } from "next";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { MoodExplorer } from "./_components/mood-explorer";
import { StoryGrid } from "./_components/story-grid";
import { getAuthors, getSeoPages, getStories } from "@/lib/notion";
import { recentStories } from "@/lib/notion/recent-stories";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const { props: { srcSet: desktopHeroSrcSet } } = getImageProps({
  src: "/images/home-hero.png",
  alt: "",
  width: 1810,
  height: 869,
  sizes: "100vw",
});

const { props: mobileHeroProps } = getImageProps({
  src: "/images/home-hero-mobile.webp",
  alt: "",
  width: 750,
  height: 1000,
  sizes: "100vw",
  loading: "eager",
  fetchPriority: "high",
});

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
        <picture className="home-hero-picture">
          <source media="(min-width: 601px)" srcSet={desktopHeroSrcSet} sizes="100vw" />
          <img {...mobileHeroProps} className="home-hero-background" />
        </picture>
        <div className="home-hero-content">
          <p className="home-hero-eyebrow">Dark romance · Romantasy · Lecturas intensas</p>
          <h1 id="home-hero-title">Dark romance en español<br />para tu próxima <em>obsesión</em></h1>
          <p className="home-hero-description">
            Lecturas de dark romance que cuesta dejar.<br />{" "}
            Encuentra qué leer después.
          </p>
          <div className="home-hero-actions">
            <Link className="home-hero-action home-hero-action-primary" href="/historias">
              Ver libros de dark romance
              <Image src="/icons/hero-arrow-primary.svg" alt="" width={20} height={20} />
            </Link>
            <Link className="home-hero-action home-hero-action-secondary" href="/listas">
              Ver recomendaciones
              <Image src="/icons/hero-arrow-secondary.svg" alt="" width={20} height={20} />
            </Link>
          </div>
        </div>
      </section>
      <MoodExplorer stories={stories} />
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
            <Link className="home-section-more home-hero-action home-hero-action-secondary" href="/historias">
              Ver más libros <Image src="/icons/hero-arrow-secondary.svg" alt="" width={20} height={20} />
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
              <p>Selecciones de dark romance para elegir según lo que te apetece leer.</p>
            </div>
            <Link className="home-section-more home-hero-action home-hero-action-secondary" href="/listas">
              Todas las listas <Image src="/icons/hero-arrow-secondary.svg" alt="" width={20} height={20} />
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

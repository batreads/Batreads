import Image from "next/image";
import Link from "next/link";
import { MoodExplorer } from "./_components/mood-explorer";
import { StoryGrid } from "./_components/story-grid";
import { getAuthors, getStories } from "@/lib/notion";

const featuredSlugs = [
  "nido-de-viboras-ka-knight",
  "credence",
  "hunting-adeline",
  "five-brothers",
  "srta-mc-millan-abby-assou",
];

export default async function Home() {
  const [stories, authors] = await Promise.all([getStories(), getAuthors()]);
  const featuredStories = [
    ...featuredSlugs.flatMap((slug) => stories.filter((story) => story.slug === slug)),
    ...stories.filter((story) => !featuredSlugs.includes(story.slug)),
  ].slice(0, 4);
  const authorNames = Object.fromEntries(authors.map((author) => [author.id, author.name]));

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
              <h2 id="home-recommendations-title">Recomendados por Batreads</h2>
              <p className="home-recommendations-description">
                Historias que se leen con la puerta cerrada: cuatro hallazgos intensos,
                oscuros y difíciles de olvidar para ampliar tu próxima lista de lectura.
              </p>
            </div>
            <Link className="home-recommendations-more" href="/historias">
              Ver más libros <span aria-hidden="true">›</span>
            </Link>
          </div>
          <StoryGrid stories={featuredStories} authorNames={authorNames} />
        </div>
      </section>
    </main>
  );
}

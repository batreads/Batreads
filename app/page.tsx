import { ListCard, ListCardGrid } from "@/app/_components/list-card";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MoodExplorer } from "./_components/mood-explorer";
import { EditorialImage } from "./_components/editorial-image";
import { BookShelf } from "./_components/book-shelf";
import { getAuthors, getSeoPages, getStories } from "@/lib/notion";
import { matchesMood, moods } from "@/lib/moods";
import { recentStories } from "@/lib/notion/recent-stories";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [stories, authors, seoPages] = await Promise.all([getStories(), getAuthors(), getSeoPages()]);
  const availableMoods = moods.filter((mood) => stories.some((story) => matchesMood(story, mood)));
  const latestStories = recentStories(stories, 10);
  const authorNames = Object.fromEntries(authors.map((author) => [author.id, author.name]));
  const featuredAuthors = ["leigh-rivers", "rina-kent", "harley-laroux", "hd-carlton"]
    .flatMap((slug) => authors.filter((author) => author.slug === slug))
    .map((author) => ({
      author,
      book: recentStories(stories.filter((story) => story.authorId === author.id && story.coverUrl), 1)[0],
    }));
  const lists = seoPages
    .filter((page) => page.section === "listas")
    .sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt))
    .slice(0, 4);

  const shelfHeading = <h2 id="home-recommendations-title">Últimas lecturas</h2>;

  return (
    <main className="home-page">
      <div className="home-opening">
        <section className="home-hero" aria-labelledby="home-hero-title">
          <div className="home-hero-content">
            <p className="home-hero-eyebrow">Dark romance · Romantasy · Lecturas intensas</p>
            <h1 id="home-hero-title">Dark romance en español para tu próxima <em>obsesión</em></h1>
            <p className="home-hero-description">
              Lecturas de dark romance que cuesta dejar.{" "}
              Encuentra qué leer después.
            </p>
            <div className="home-discovery-actions">
              <Link className="home-hero-action home-hero-action-primary home-catalog-link" href="/historias">
                Ver libros de dark romance
                <Image src="/icons/hero-arrow-primary.svg" alt="" width={20} height={20} />
              </Link>
              {availableMoods.length > 0 && (
                <Link className="home-text-link" href="#moods">
                  Elegir según mi ánimo <span aria-hidden="true">↓</span>
                </Link>
              )}
            </div>
          </div>
        </section>
        <section className="home-recommendations" aria-labelledby="home-recommendations-title">
          <div className="home-recommendations-inner">
            {latestStories.length ? (
              <BookShelf label="Últimas lecturas" heading={shelfHeading} bookTitleAsHeading nativeLazy stories={latestStories.map((story) => ({
                id: story.id,
                slug: story.slug,
                title: story.title,
                coverUrl: story.coverUrl,
                tropes: [...new Set(story.tropes.map((trope) => trope.split(" · ")[0].trim()).filter(Boolean))].slice(0, 2),
                authorName: (story.authorId && authorNames[story.authorId]) || story.authorName,
              }))} />
            ) : <>{shelfHeading}<p>Todavía no hay historias publicadas.</p></>}
            <p className="home-recommendations-description">
              Lo último que hemos leído: historias intensas y oscuras,
              de esas que se leen con la puerta cerrada y cuesta olvidar.
            </p>
          </div>
        </section>
      </div>
      <MoodExplorer moods={availableMoods} />
      <section className="home-lists" id="listas" aria-labelledby="home-lists-title">
        <div className="home-lists-inner">
          <div className="home-lists-heading">
            <div>
              <h2 id="home-lists-title">Listas Batreads</h2>
              <p>Selecciones de dark romance para elegir según lo que te apetece leer.</p>
            </div>
            <Link className="home-text-link home-section-more" href="/listas">
              Todas las listas <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ListCardGrid>
            {lists.map((page) => (
              <ListCard page={page} stories={stories} key={page.id} />
            ))}
          </ListCardGrid>
        </div>
      </section>
      {featuredAuthors.length > 0 && (
        <section className="home-authors" aria-labelledby="home-authors-title">
          <div className="home-authors-inner">
            <div className="home-authors-heading">
              <h2 id="home-authors-title">Explora por autora</h2>
              <Link className="home-text-link" href="/autoras">Todas las autoras <span aria-hidden="true">→</span></Link>
            </div>
            <ul className="home-author-grid">
              {featuredAuthors.map(({ author, book }) => (
                <li key={author.id}>
                  <Link href={`/autoras/${author.slug}`}>
                    <span className="home-author-art" aria-hidden="true">
                      {book?.coverUrl
                        ? <EditorialImage src={book.coverUrl} alt="" width={48} height={72} sizes="48px" />
                        : author.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("")}
                    </span>
                    <span className="home-author-copy">
                      <span className="home-author-name">{author.name}</span>
                      {book && <span className="home-author-book">Un libro suyo: {book.title}</span>}
                      <span className="home-author-profile">Ver autora <span aria-hidden="true">→</span></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}

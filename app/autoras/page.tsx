import type { Metadata } from "next";
import { AuthorCard } from "../_components/author-card";
import { Breadcrumbs } from "../_components/breadcrumbs";
import { getAuthors, getStories } from "@/lib/notion";
import { websiteOpenGraph } from "@/lib/seo-metadata";

export const metadata: Metadata = {
  title: "Autoras de dark romance y libros recomendados | Batreads",
  description: "Conoce a las autoras de los libros que hemos leído y descubre sus historias, sagas y nuestras recomendaciones de lectura.",
  alternates: { canonical: "/autoras" },
  openGraph: websiteOpenGraph("/autoras"),
};

export default async function AutorasPage() {
  const [authors, stories] = await Promise.all([getAuthors(), getStories()]);
  return (
    <main className="catalog-page">
      <Breadcrumbs items={[{ label: "Autoras" }]} />
      <header className="page-heading">
        <p className="eyebrow">Nombres detrás de las historias</p>
        <h1>Autoras</h1>
      </header>
      {authors.length === 0 ? <p>Todavía no hay autoras con historias publicadas.</p> : (
        <div className="entity-grid">{authors.map((author) => (
          <AuthorCard author={author} storyCount={stories.filter((story) => story.authorId === author.id).length} key={author.id} />
        ))}</div>
      )}
    </main>
  );
}

import Link from "next/link";
import { StoryGrid } from "../_components/story-grid";
import { getAuthors, getStories } from "@/lib/notion";

export default async function HistoriasPage() {
  const [stories, authors] = await Promise.all([getStories(), getAuthors()]);
  const authorNames = Object.fromEntries(authors.map((author) => [author.id, author.name]));

  return (
    <main className="catalog-page">
      <Link className="back-link" href="/">← Batreads</Link>
      <header className="page-heading">
        <p className="eyebrow">Biblioteca editorial</p>
        <h1>Historias</h1>
        <p>Descubre historias de dark romance con contexto, intensidad y criterio editorial.</p>
      </header>
      <StoryGrid stories={stories} authorNames={authorNames} />
    </main>
  );
}

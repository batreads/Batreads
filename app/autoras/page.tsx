import Link from "next/link";
import { getAuthors, getStories } from "@/lib/notion";

export default async function AutorasPage() {
  const [authors, stories] = await Promise.all([getAuthors(), getStories()]);
  return (
    <main className="catalog-page">
      <Link className="back-link" href="/">← Batreads</Link>
      <header className="page-heading">
        <p className="eyebrow">Nombres detrás de las historias</p>
        <h1>Autoras</h1>
      </header>
      {authors.length === 0 ? <p>Todavía no hay autoras con historias publicadas.</p> : (
        <div className="entity-grid">{authors.map((author) => (
          <Link className="entity-card" href={`/autoras/${author.slug}`} key={author.id}>
            <h2>{author.name}</h2>
            {author.intro ? <p>{author.intro}</p> : null}
            <span>{stories.filter((story) => story.authorId === author.id).length} historias · Ver autora →</span>
          </Link>
        ))}</div>
      )}
    </main>
  );
}

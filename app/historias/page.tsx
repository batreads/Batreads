import Link from "next/link";
import { getStories } from "@/lib/notion";

export default async function HistoriasPage() {
  const stories = await getStories();

  return (
    <main className="catalog-page">
      <Link className="back-link" href="/">← Batreads</Link>
      <header className="page-heading">
        <p className="eyebrow">Biblioteca editorial</p>
        <h1>Historias</h1>
        <p>Descubre historias de dark romance con contexto, intensidad y criterio editorial.</p>
      </header>
      {stories.length === 0 ? (
        <p>Todavía no hay historias publicadas.</p>
      ) : (
        <div className="story-grid">
          {stories.map((story) => (
            <Link className="story-card" href={`/historias/${story.slug}`} key={story.id}>
              {story.coverUrl ? <img src={story.coverUrl} alt={`Portada de ${story.title}`} /> : null}
              <div className="story-card-body">
                <h2>{story.title}</h2>
                {story.hook ? <p>{story.hook}</p> : null}
                <span>Ver ficha →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

import Link from "next/link";
import { getSagas, getStories } from "@/lib/notion";

export default async function SagasPage() {
  const [sagas, stories] = await Promise.all([getSagas(), getStories()]);
  return (
    <main className="catalog-page">
      <Link className="back-link" href="/">← Batreads</Link>
      <header className="page-heading"><p className="eyebrow">Universos para explorar</p><h1>Sagas</h1></header>
      {sagas.length === 0 ? <p>Todavía no hay sagas con historias publicadas.</p> : (
        <div className="entity-grid">{sagas.map((saga) => (
          <Link className="entity-card" href={`/sagas/${saga.slug}`} key={saga.id}>
            <h2>{saga.name}</h2>
            {saga.intro || saga.description ? <p>{saga.intro || saga.description}</p> : null}
            <span>{stories.filter((story) => story.sagaId === saga.id).length} historias · Ver saga →</span>
          </Link>
        ))}</div>
      )}
    </main>
  );
}

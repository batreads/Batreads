import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../_components/breadcrumbs";
import { getSagas, getStories } from "@/lib/notion";

export const metadata: Metadata = {
  title: "Sagas de dark romance: orden de lectura | Batreads",
  description: "Descubre las sagas de dark romance presentes en Batreads, sus libros y autoras, y consulta el orden de lectura para saber por dónde empezar.",
  alternates: { canonical: "/sagas" },
};

export default async function SagasPage() {
  const [sagas, stories] = await Promise.all([getSagas(), getStories()]);
  return (
    <main className="catalog-page">
      <Breadcrumbs items={[{ label: "Sagas" }]} />
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

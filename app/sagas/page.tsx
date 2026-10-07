import type { Metadata } from "next";
import { Breadcrumbs } from "../_components/breadcrumbs";
import { SagaCard } from "../_components/saga-card";
import { getAuthors, getSagas, getStories } from "@/lib/notion";
import { websiteOpenGraph } from "@/lib/seo-metadata";

export const metadata: Metadata = {
  title: "Sagas de dark romance: orden de lectura | Batreads",
  description: "Descubre las sagas de dark romance presentes en Batreads, sus libros y autoras, y consulta el orden de lectura para saber por dónde empezar.",
  alternates: { canonical: "/sagas" },
  openGraph: websiteOpenGraph("/sagas"),
};

export default async function SagasPage() {
  const [sagas, stories, authors] = await Promise.all([getSagas(), getStories(), getAuthors()]);
  const authorNames = new Map(authors.map((author) => [author.id, author.name]));
  return (
    <main className="catalog-page">
      <Breadcrumbs items={[{ label: "Sagas" }]} />
      <header className="page-heading"><p className="eyebrow">Universos para explorar</p><h1>Sagas</h1></header>
      {sagas.length === 0 ? <p>Todavía no hay sagas con historias publicadas.</p> : (
        <div className="saga-card-grid">{sagas.map((saga) => (
          <SagaCard
            key={saga.id}
            saga={saga}
            stories={stories.filter((story) => story.sagaId === saga.id)}
            authorName={saga.authorIds.map((id) => authorNames.get(id)).filter(Boolean).join(", ") || undefined}
          />
        ))}</div>
      )}
    </main>
  );
}

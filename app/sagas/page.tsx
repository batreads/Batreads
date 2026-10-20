import { ListCard, ListCardGrid } from "@/app/_components/list-card";
import type { Metadata } from "next";
import { Breadcrumbs } from "../_components/breadcrumbs";
import { SagaCard } from "../_components/saga-card";
import { getAuthors, getSagas, getSeoPages, getStories, storiesForSeoPage } from "@/lib/notion";
import { websiteOpenGraph } from "@/lib/seo-metadata";
import "./catalog.css";

export const metadata: Metadata = {
  title: "Sagas de dark romance: libros y orden de lectura | Batreads",
  description: "Explora sagas de dark romance, descubre sus libros y autoras y consulta el orden de lectura. Conoce qué historias son autoconclusivas y cómo se conectan.",
  alternates: { canonical: "/sagas" },
  openGraph: websiteOpenGraph("/sagas"),
};

export default async function SagasPage() {
  const [sagas, stories, authors, seoPages] = await Promise.all([getSagas(), getStories(), getAuthors(), getSeoPages()]);
  const sagaIds = new Set(sagas.map((saga) => saga.id));
  const relatedLists = seoPages
    .filter((page) => page.section === "listas" && page.indexable)
    .map((page) => ({
      page,
      relevance: page.sagaIds.some((id) => sagaIds.has(id)) ? 2
        : storiesForSeoPage(page, stories, authors, sagas).some((story) => story.sagaId && sagaIds.has(story.sagaId)) ? 1 : 0,
    }))
    .filter(({ relevance }) => relevance > 0)
    .sort((a, b) => b.relevance - a.relevance
      || (b.page.publishedAt ?? b.page.createdAt).localeCompare(a.page.publishedAt ?? a.page.createdAt)
      || a.page.path.localeCompare(b.page.path, "es"))
    .slice(0, 3)
    .map(({ page }) => page);
  return (
    <main className="catalog-page sagas-catalog-page">
      <Breadcrumbs items={[{ label: "Sagas" }]} structuredDataPath="/sagas" />
      <header className="page-heading">
        <h1>Sagas de dark romance y su orden de lectura</h1>
        <p>Encuentra tu próxima saga de dark romance. Descubre sus libros y autoras, consulta por dónde empezar y conoce cómo se conectan sus historias: desde romances autoconclusivos en un mismo universo hasta series que siguen a la misma pareja.</p>
      </header>
      {sagas.length === 0 ? <p>Todavía no hay sagas con historias publicadas.</p> : (
        <div className="saga-card-grid">{sagas.map((saga) => (
          <SagaCard
            key={saga.id}
            saga={saga}
            stories={stories.filter((story) => story.sagaId === saga.id)}
            authors={authors}
            showDiscovery
            showRelationshipTags={false}
          />
        ))}</div>
      )}
      {relatedLists.length > 0 ? <section className="sagas-related-lists" aria-labelledby="sagas-related-lists-title">
        <p className="eyebrow">Sigue explorando</p>
        <h2 id="sagas-related-lists-title">Listas para encontrar tu próxima saga</h2>
        <ListCardGrid>
          {relatedLists.map((page) => <ListCard page={page} stories={stories} key={page.id} />)}
        </ListCardGrid>
      </section> : null}
    </main>
  );
}

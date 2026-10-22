import { ListCard, ListCardGrid } from "@/app/_components/list-card";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../_components/breadcrumbs";
import { SagaCard } from "../_components/saga-card";
import { getAuthors, getSagas, getSeoPages, getStories, storiesForSeoPage } from "@/lib/notion";
import { websiteOpenGraph } from "@/lib/seo-metadata";
import "./catalog.css";

const SAGAS_PER_PAGE = 10;
type SagasPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const pagePath = (page: number) => page === 1 ? "/sagas" : `/sagas?page=${page}`;

export async function generateMetadata({ searchParams }: SagasPageProps): Promise<Metadata> {
  const { page } = await searchParams;
  const pageNumber = typeof page === "string" && /^[1-9]\d*$/.test(page) && Number.isSafeInteger(Number(page)) ? Number(page) : 1;
  return {
  title: "Sagas de dark romance: libros y orden de lectura | Batreads",
  description: "Explora sagas de dark romance, descubre sus libros y autoras y consulta el orden de lectura. Conoce qué historias son autoconclusivas y cómo se conectan.",
  alternates: { canonical: pagePath(pageNumber) },
  openGraph: websiteOpenGraph(pagePath(pageNumber)),
  };
}

export default async function SagasPage({ searchParams }: SagasPageProps) {
  const [sagas, stories, authors, seoPages] = await Promise.all([getSagas(), getStories(), getAuthors(), getSeoPages()]);
  const { page: requestedPage } = await searchParams;
  const pageCount = Math.max(1, Math.ceil(sagas.length / SAGAS_PER_PAGE));
  if (requestedPage !== undefined && (typeof requestedPage !== "string"
    || !/^[1-9]\d*$/.test(requestedPage) || !Number.isSafeInteger(Number(requestedPage))
    || Number(requestedPage) > pageCount)) notFound();
  const page = Number(requestedPage ?? 1);
  const pageStart = (page - 1) * SAGAS_PER_PAGE;
  const visibleSagas = sagas.slice(pageStart, pageStart + SAGAS_PER_PAGE);
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
        <div className="saga-card-grid">{visibleSagas.map((saga) => (
          <SagaCard
            key={saga.id}
            saga={saga}
            stories={stories.filter((story) => story.sagaId === saga.id)}
            authors={authors}
            linkAuthors={false}
            showDiscovery
            showGenre={false}
            showLink={false}
            showRelationshipTags={false}
          />
        ))}</div>
      )}
      {sagas.length > 0 ? <>
        <p className="stories-results-range">Mostrando {pageStart + 1}–{Math.min(pageStart + SAGAS_PER_PAGE, sagas.length)} de {sagas.length} sagas</p>
        <nav className="stories-pagination" aria-label="Paginación de sagas">
          {page > 1 ? <Link href={pagePath(page - 1)}>← Anterior</Link>
            : <span className="stories-pagination-disabled" aria-disabled="true">← Anterior</span>}
          <div className="stories-pagination-pages">
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => (
              <Link key={item} href={pagePath(item)} aria-current={item === page ? "page" : undefined} aria-label={`Página ${item}`}>{item}</Link>
            ))}
          </div>
          {page < pageCount ? <Link href={pagePath(page + 1)}>Siguiente →</Link>
            : <span className="stories-pagination-disabled" aria-disabled="true">Siguiente →</span>}
        </nav>
      </> : null}
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

import { ListCard, ListCardGrid } from "@/app/_components/list-card";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthorCard } from "../_components/author-card";
import { Breadcrumbs, createBreadcrumbList } from "../_components/breadcrumbs";
import { getAuthors, getSagas, getSeoPages, getStories, storiesForSeoPage } from "@/lib/notion";
import type { Story } from "@/lib/notion";
import { websiteOpenGraph } from "@/lib/seo-metadata";
import { siteUrl } from "@/lib/site-url";

const heading = "Autoras de dark romance que deberías conocer";
const intro = "¿Buscas nuevas autoras de dark romance? Descubre escritoras conocidas y otras menos populares, explora sus libros y sagas, y encuentra recomendaciones para saber por dónde empezar.";

const AUTHORS_PER_PAGE = 10;
type AutorasPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const pagePath = (page: number) => page === 1 ? "/autoras" : `/autoras?page=${page}`;

export async function generateMetadata({ searchParams }: AutorasPageProps): Promise<Metadata> {
  const { page } = await searchParams;
  const pageNumber = typeof page === "string" && /^[1-9]\d*$/.test(page) && Number.isSafeInteger(Number(page)) ? Number(page) : 1;
  return {
  title: "Mejores autoras de dark romance y sus libros | Batreads",
  description: "Conoce a las autoras de los libros que hemos leído y descubre sus historias, sagas y nuestras recomendaciones de lectura.",
  alternates: { canonical: pagePath(pageNumber) },
  openGraph: websiteOpenGraph(pagePath(pageNumber)),
  };
}

export default async function AutorasPage({ searchParams }: AutorasPageProps) {
  const [authors, stories, sagas, seoPages] = await Promise.all([
    getAuthors(), getStories(), getSagas(), getSeoPages(),
  ]);
  const { page: requestedPage } = await searchParams;
  const pageCount = Math.max(1, Math.ceil(authors.length / AUTHORS_PER_PAGE));
  if (requestedPage !== undefined && (typeof requestedPage !== "string"
    || !/^[1-9]\d*$/.test(requestedPage) || !Number.isSafeInteger(Number(requestedPage))
    || Number(requestedPage) > pageCount)) notFound();
  const page = Number(requestedPage ?? 1);
  const pageStart = (page - 1) * AUTHORS_PER_PAGE;
  const visibleAuthors = authors.slice(pageStart, pageStart + AUTHORS_PER_PAGE);
  const bestRatedStoryByAuthor = new Map<string, Story>();
  for (const story of stories) {
    if (!story.authorId || story.rating === null || !Number.isFinite(story.rating)) continue;
    const current = bestRatedStoryByAuthor.get(story.authorId);
    if (!current || story.rating > current.rating! || (
      story.rating === current.rating && story.title.localeCompare(current.title, "es") < 0
    )) bestRatedStoryByAuthor.set(story.authorId, story);
  }

  const authorIds = new Set(authors.map((author) => author.id));
  const storiesById = new Map(stories.map((story) => [story.id, story]));
  const relatedLists = seoPages
    .filter((page) => page.section === "listas" && page.indexable)
    .map((page) => {
      const hasRelatedAuthor = page.authorIds.some((id) => authorIds.has(id));
      const hasRelatedStory = page.mainStoryIds.some((id) => authorIds.has(storiesById.get(id)?.authorId ?? ""))
        || storiesForSeoPage(page, stories, authors, sagas)
          .some((story) => authorIds.has(story.authorId ?? ""));
      return { page, relevance: hasRelatedAuthor ? 2 : hasRelatedStory ? 1 : 0 };
    })
    .sort((a, b) => b.relevance - a.relevance
      || (b.page.publishedAt ?? b.page.createdAt).localeCompare(a.page.publishedAt ?? a.page.createdAt)
      || b.page.createdAt.localeCompare(a.page.createdAt)
      || a.page.path.localeCompare(b.page.path, "es"))
    .slice(0, 3)
    .map(({ page }) => page);
  const authorsUrl = new URL(pagePath(page), siteUrl).toString();
  const breadcrumb = createBreadcrumbList([{ label: "Autoras" }], pagePath(page));
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumb,
      {
        "@type": "CollectionPage",
        "@id": `${authorsUrl}#webpage`,
        url: authorsUrl,
        name: heading,
        description: intro,
        breadcrumb: { "@id": breadcrumb["@id"] },
        mainEntity: {
          "@type": "ItemList",
          "@id": `${authorsUrl}#authors`,
          numberOfItems: visibleAuthors.length,
          itemListElement: visibleAuthors.map((author, index) => ({
            "@type": "ListItem",
            position: pageStart + index + 1,
            name: author.name,
            item: new URL(`/autoras/${author.slug}`, siteUrl).toString(),
          })),
        },
      },
    ],
  };

  return (
    <main className="catalog-page authors-catalog-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }} />
      <Breadcrumbs items={[{ label: "Autoras" }]} />
      <header className="page-heading">
        <h1>{heading}</h1>
        <p>{intro}</p>
      </header>
      {authors.length === 0 ? <p>Todavía no hay autoras con historias publicadas.</p> : (
        <div className="author-grid">{visibleAuthors.map((author) => (
          <AuthorCard author={author} recommendedStory={bestRatedStoryByAuthor.get(author.id)} key={author.id} />
        ))}</div>
      )}
      {pageCount > 1 ? <>
        <p className="stories-results-range">Mostrando {pageStart + 1}–{Math.min(pageStart + AUTHORS_PER_PAGE, authors.length)} de {authors.length} autoras</p>
        <nav className="stories-pagination" aria-label="Paginación de autoras">
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
      {relatedLists.length > 0 ? (
        <section className="authors-related-lists" aria-labelledby="authors-related-lists-title">
          <p className="eyebrow">Sigue explorando</p>
          <h2 id="authors-related-lists-title">Encuentra tu próxima lectura</h2>
          <ListCardGrid>
            {relatedLists.map((page) => (
              <ListCard page={page} stories={stories} key={page.id} />
            ))}
          </ListCardGrid>
        </section>
      ) : null}
    </main>
  );
}

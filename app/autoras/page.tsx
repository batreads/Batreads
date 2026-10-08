import type { Metadata } from "next";
import Link from "next/link";
import { AuthorCard } from "../_components/author-card";
import { Breadcrumbs } from "../_components/breadcrumbs";
import { getAuthors, getSagas, getSeoPages, getStories, storiesForSeoPage } from "@/lib/notion";
import type { Story } from "@/lib/notion";
import { websiteOpenGraph } from "@/lib/seo-metadata";
import { siteUrl } from "@/lib/site-url";

const heading = "Autoras de dark romance que deberías conocer";
const intro = "¿Buscas nuevas autoras de dark romance? Descubre escritoras conocidas y otras menos populares, explora sus libros y sagas, y encuentra recomendaciones para saber por dónde empezar.";

export const metadata: Metadata = {
  title: "Mejores autoras de dark romance y sus libros | Batreads",
  description: "Conoce a las autoras de los libros que hemos leído y descubre sus historias, sagas y nuestras recomendaciones de lectura.",
  alternates: { canonical: "/autoras" },
  openGraph: websiteOpenGraph("/autoras"),
};

export default async function AutorasPage() {
  const [authors, stories, sagas, seoPages] = await Promise.all([
    getAuthors(), getStories(), getSagas(), getSeoPages(),
  ]);
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
  const authorsUrl = new URL("/autoras", siteUrl).toString();
  const breadcrumbId = `${authorsUrl}#breadcrumb`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl.toString() },
          { "@type": "ListItem", position: 2, name: "Autoras", item: authorsUrl },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": `${authorsUrl}#webpage`,
        url: authorsUrl,
        name: heading,
        description: intro,
        breadcrumb: { "@id": breadcrumbId },
        mainEntity: {
          "@type": "ItemList",
          "@id": `${authorsUrl}#authors`,
          numberOfItems: authors.length,
          itemListElement: authors.map((author, index) => ({
            "@type": "ListItem",
            position: index + 1,
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
        <p className="eyebrow">Nombres detrás de las historias</p>
        <h1>{heading}</h1>
        <p>{intro}</p>
      </header>
      {authors.length === 0 ? <p>Todavía no hay autoras con historias publicadas.</p> : (
        <div className="author-grid">{authors.map((author) => (
          <AuthorCard author={author} recommendedStory={bestRatedStoryByAuthor.get(author.id)} key={author.id} />
        ))}</div>
      )}
      {relatedLists.length > 0 ? (
        <section className="authors-related-lists" aria-labelledby="authors-related-lists-title">
          <p className="eyebrow">Sigue explorando</p>
          <h2 id="authors-related-lists-title">Encuentra tu próxima lectura</h2>
          <div className="authors-related-lists-grid">
            {relatedLists.map((page) => (
              <Link className="home-list-card author-discover-card" href={page.path} key={page.id}>
                <span className="home-list-card-label">Lista editorial</span>
                <h3>{page.heading}</h3>
                {page.summary ? <p>{page.summary}</p> : null}
                <span className="author-discover-action">Explorar lista →</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

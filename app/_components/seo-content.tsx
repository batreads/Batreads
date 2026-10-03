import Link from "next/link";
import { Breadcrumbs } from "./breadcrumbs";
import { EditorialListContent } from "./editorial-list-content";
import { StoryGrid } from "./story-grid";
import { getEditorialBlocks, getSeoPages, storiesForSeoPage, type Author, type Saga, type SeoPage, type Story } from "@/lib/notion";

function paragraphs(value: string) {
  return value.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>);
}

function faqParagraphs(value: string) {
  return value.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => {
    const match = paragraph.match(/^([^?]+\?)\s*([\s\S]*)$/);
    return match
      ? <p key={index}><strong>{match[1]}</strong><span>{match[2]}</span></p>
      : <p key={index}>{paragraph}</p>;
  });
}

export async function SeoContent({
  page,
  stories,
  authors,
  sagas,
}: {
  page: SeoPage;
  stories: Story[];
  authors: Author[];
  sagas: Saga[];
}) {
  const relatedStories = storiesForSeoPage(page, stories, authors, sagas);
  const authorNames = Object.fromEntries(authors.map((author) => [author.id, author.name]));
  const relatedAuthorIds = new Set(page.authorIds);
  if (page.pageType === "BooksLikeLanding") {
    for (const story of relatedStories) if (story.authorId) relatedAuthorIds.add(story.authorId);
  }
  const relatedAuthors = authors.filter((author) => relatedAuthorIds.has(author.id));
  const relatedSagas = sagas.filter((saga) => page.sagaIds.includes(saga.id));
  const [editorialBlocks, seoPages] = await Promise.all([getEditorialBlocks(page.id), getSeoPages()]);
  const notionPathsById = Object.fromEntries([
    ...stories.map((story) => [story.id, `/historias/${story.slug}`]),
    ...authors.map((author) => [author.id, `/autoras/${author.slug}`]),
    ...sagas.map((saga) => [saga.id, `/sagas/${saga.slug}`]),
    ...seoPages.map((seoPage) => [seoPage.id, seoPage.path]),
  ].map(([id, path]) => [id.replaceAll("-", "").toLowerCase(), path]));
  const booksLike = page.pageType === "BooksLikeLanding";

  return (
    <main className={`catalog-page${page.section === "listas" ? " list-detail-page" : ""}${booksLike ? " books-like-page" : ""}`}>
      <Breadcrumbs items={[{ label: "Listas", href: "/listas" }, { label: page.heading }]} />
      <header className="page-heading">
        {booksLike ? (page.topic ? <p className="eyebrow">{page.topic}</p> : null) : <p className="eyebrow">Lista editorial</p>}
        <h1>{page.heading}</h1>
        {!booksLike && (page.summary || page.description) ? <p>{page.summary || page.description}</p> : null}
      </header>
      {editorialBlocks.length > 0 ? <EditorialListContent blocks={editorialBlocks} stories={relatedStories} authorNames={authorNames} booksLike={booksLike} notionPathsById={notionPathsById} /> : (
        <>
          {page.intro ? <section className="story-section seo-intro-section"><h2>Introducción</h2>{paragraphs(page.intro)}</section> : null}
          {relatedStories.length > 0 ? <section className="story-section seo-books-section home-story-cards"><h2>Libros recomendados</h2><StoryGrid stories={relatedStories} authorNames={authorNames} headingLevel={3} /></section> : null}
        </>
      )}
      {relatedAuthors.length > 0 ? <section className="story-section"><h2>Autoras relacionadas</h2><ul className="link-list">{relatedAuthors.map((author) => <li key={author.id}><Link href={`/autoras/${author.slug}`}>{author.name} →</Link></li>)}</ul></section> : null}
      {relatedSagas.length > 0 ? <section className="story-section"><h2>Sagas relacionadas</h2><ul className="link-list">{relatedSagas.map((saga) => <li key={saga.id}><Link href={`/sagas/${saga.slug}`}>{saga.name} →</Link></li>)}</ul></section> : null}
      {editorialBlocks.length === 0 && page.faqs ? <section className="story-section faq-section"><h2>Preguntas frecuentes</h2>{faqParagraphs(page.faqs)}</section> : null}
      {editorialBlocks.length === 0 && page.conclusion ? <section className="story-section"><h2>Para terminar</h2>{paragraphs(page.conclusion)}</section> : null}
      {editorialBlocks.length === 0 && page.cta ? <p className="entity-note">{page.cta}</p> : null}
    </main>
  );
}

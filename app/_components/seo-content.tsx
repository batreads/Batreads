import Link from "next/link";
import { EditorialListContent } from "./editorial-list-content";
import { StoryGrid } from "./story-grid";
import { getEditorialBlocks, storiesForSeoPage, type Author, type Saga, type SeoPage, type Story } from "@/lib/notion";

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
  const relatedAuthors = authors.filter((author) => page.authorIds.includes(author.id));
  const relatedSagas = sagas.filter((saga) => page.sagaIds.includes(saga.id));
  const editorialBlocks = page.path === "/mafia-romance-en-espanol" ? await getEditorialBlocks(page.id) : [];

  return (
    <main className={`catalog-page${page.section === "listas" ? " list-detail-page" : ""}`}>
      <Link className="back-link" href={page.section === "listas" ? "/listas" : "/"}>← {page.section === "listas" ? "Todas las listas" : "Batreads"}</Link>
      <header className="page-heading">
        <p className="eyebrow">{page.section === "listas" ? "Lista editorial" : "Guía Batreads"}</p>
        <h1>{page.heading}</h1>
        {page.summary || page.description ? <p>{page.summary || page.description}</p> : null}
      </header>
      {editorialBlocks.length > 0 ? <EditorialListContent blocks={editorialBlocks} stories={relatedStories} authorNames={authorNames} /> : (
        <>
          {page.intro ? <section className="story-section seo-intro-section"><h2>Introducción</h2>{paragraphs(page.intro)}</section> : null}
          {relatedStories.length > 0 ? <section className="story-section seo-books-section home-story-cards"><h2>{page.section === "listas" ? "Libros recomendados" : "Historias relacionadas"}</h2><StoryGrid stories={relatedStories} authorNames={authorNames} headingLevel={3} /></section> : null}
        </>
      )}
      {relatedAuthors.length > 0 ? <section className="story-section"><h2>Autoras relacionadas</h2><ul className="link-list">{relatedAuthors.map((author) => <li key={author.id}><Link href={`/autoras/${author.slug}`}>{author.name} →</Link></li>)}</ul></section> : null}
      {relatedSagas.length > 0 ? <section className="story-section"><h2>Sagas relacionadas</h2><ul className="link-list">{relatedSagas.map((saga) => <li key={saga.id}><Link href={`/sagas/${saga.slug}`}>{saga.name} →</Link></li>)}</ul></section> : null}
      {editorialBlocks.length === 0 && page.faqs ? <section className="story-section faq-section"><h2>Preguntas frecuentes</h2>{page.section === "listas" ? faqParagraphs(page.faqs) : paragraphs(page.faqs)}</section> : null}
      {editorialBlocks.length === 0 && page.conclusion ? <section className="story-section"><h2>Para terminar</h2>{paragraphs(page.conclusion)}</section> : null}
      {editorialBlocks.length === 0 && page.cta ? <p className="entity-note">{page.cta}</p> : null}
    </main>
  );
}

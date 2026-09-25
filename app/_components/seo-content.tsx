import Link from "next/link";
import { StoryGrid } from "./story-grid";
import { storiesForSeoPage, type Author, type Saga, type SeoPage, type Story } from "@/lib/notion";

function paragraphs(value: string) {
  return value.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>);
}

export function SeoContent({
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
  const relatedAuthors = authors.filter((author) => page.authorIds.includes(author.id));
  const relatedSagas = sagas.filter((saga) => page.sagaIds.includes(saga.id));

  return (
    <main className="catalog-page">
      <Link className="back-link" href={page.section === "listas" ? "/listas" : "/"}>← {page.section === "listas" ? "Todas las listas" : "Batreads"}</Link>
      <header className="page-heading">
        <p className="eyebrow">{page.section === "listas" ? "Lista editorial" : "Guía Batreads"}</p>
        <h1>{page.heading}</h1>
        {page.description ? <p>{page.description}</p> : null}
      </header>
      {page.intro ? <section className="story-section"><h2>Introducción</h2>{paragraphs(page.intro)}</section> : null}
      {relatedStories.length > 0 ? <section className="story-section"><h2>Historias relacionadas</h2><StoryGrid stories={relatedStories} /></section> : null}
      {relatedAuthors.length > 0 ? <section className="story-section"><h2>Autoras relacionadas</h2><ul className="link-list">{relatedAuthors.map((author) => <li key={author.id}><Link href={`/autoras/${author.slug}`}>{author.name} →</Link></li>)}</ul></section> : null}
      {relatedSagas.length > 0 ? <section className="story-section"><h2>Sagas relacionadas</h2><ul className="link-list">{relatedSagas.map((saga) => <li key={saga.id}><Link href={`/sagas/${saga.slug}`}>{saga.name} →</Link></li>)}</ul></section> : null}
      {page.faqs ? <section className="story-section"><h2>Preguntas frecuentes</h2>{paragraphs(page.faqs)}</section> : null}
      {page.conclusion ? <section className="story-section"><h2>Para terminar</h2>{paragraphs(page.conclusion)}</section> : null}
      {page.cta ? <p className="entity-note">{page.cta}</p> : null}
    </main>
  );
}

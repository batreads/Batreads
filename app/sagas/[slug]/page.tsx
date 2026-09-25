import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StoryGrid } from "../../_components/story-grid";
import { getAuthors, getSagaBySlug, getSagas, getSeoPages, getStories } from "@/lib/notion";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getSagas()).map((saga) => ({ slug: saga.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const saga = await getSagaBySlug((await params).slug);
  return saga
    ? { title: `${saga.name} · Batreads`, description: saga.intro || saga.description, alternates: { canonical: `/sagas/${saga.slug}` } }
    : { title: "Saga no encontrada · Batreads" };
}

export default async function SagaPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const [saga, stories, authors, seoPages] = await Promise.all([getSagaBySlug(slug), getStories(), getAuthors(), getSeoPages()]);
  if (!saga) notFound();
  const sagaStories = stories.filter((story) => story.sagaId === saga.id);
  const sagaAuthors = authors.filter((author) => saga.authorIds.includes(author.id) || sagaStories.some((story) => story.authorId === author.id));
  const sagaPages = seoPages.filter((page) => page.sagaIds.includes(saga.id));

  return (
    <main className="catalog-page">
      <Link className="back-link" href="/sagas">← Todas las sagas</Link>
      <header className="page-heading"><p className="eyebrow">Saga</p><h1>{saga.name}</h1>{saga.intro ? <p>{saga.intro}</p> : null}</header>
      {saga.description ? <section className="story-section"><h2>Sobre la saga</h2><p>{saga.description}</p></section> : null}
      {saga.readingOrder ? <p className="entity-note">Orden de lectura: {saga.readingOrder}</p> : null}
      {sagaAuthors.length > 0 ? <section className="story-section"><h2>Autoras</h2><ul className="link-list">{sagaAuthors.map((author) => <li key={author.id}><Link href={`/autoras/${author.slug}`}>{author.name} →</Link></li>)}</ul></section> : null}
      <section className="story-section"><h2>Historias de la saga</h2><StoryGrid stories={sagaStories} /></section>
      {sagaPages.length > 0 ? <section className="story-section"><h2>Listas y guías</h2><ul className="link-list">{sagaPages.map((page) => <li key={page.id}><Link href={page.path}>{page.heading} →</Link></li>)}</ul></section> : null}
    </main>
  );
}

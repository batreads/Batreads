import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StoryGrid } from "../../_components/story-grid";
import { getAuthorBySlug, getAuthors, getSagas, getSeoPages, getStories } from "@/lib/notion";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getAuthors()).map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const author = await getAuthorBySlug((await params).slug);
  return author
    ? { title: `${author.name} · Batreads`, description: author.intro || author.bio, alternates: { canonical: `/autoras/${author.slug}` } }
    : { title: "Autora no encontrada · Batreads" };
}

export default async function AutoraPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const [author, stories, sagas, seoPages] = await Promise.all([getAuthorBySlug(slug), getStories(), getSagas(), getSeoPages()]);
  if (!author) notFound();
  const authorStories = stories.filter((story) => story.authorId === author.id);
  const authorSagas = sagas.filter((saga) => saga.authorIds.includes(author.id) || saga.storyIds.some((id) => authorStories.some((story) => story.id === id)));
  const authorPages = seoPages.filter((page) => page.authorIds.includes(author.id));

  return (
    <main className="catalog-page">
      <Link className="back-link" href="/autoras">← Todas las autoras</Link>
      <header className="page-heading">
        <p className="eyebrow">Autora</p>
        <h1>{author.name}</h1>
        {author.intro ? <p>{author.intro}</p> : null}
      </header>
      {author.bio ? <section className="story-section"><h2>Sobre la autora</h2><p>{author.bio}</p></section> : null}
      {authorSagas.length > 0 ? <section className="story-section"><h2>Sagas</h2><ul className="link-list">{authorSagas.map((saga) => <li key={saga.id}><Link href={`/sagas/${saga.slug}`}>{saga.name} →</Link></li>)}</ul></section> : null}
      <section className="story-section"><h2>Historias de {author.name}</h2><StoryGrid stories={authorStories} /></section>
      {authorPages.length > 0 ? <section className="story-section"><h2>Listas y guías</h2><ul className="link-list">{authorPages.map((page) => <li key={page.id}><Link href={page.path}>{page.heading} →</Link></li>)}</ul></section> : null}
      {author.website ? <p className="external-link"><a href={author.website} rel="noopener noreferrer" target="_blank">Web de la autora ↗</a></p> : null}
    </main>
  );
}

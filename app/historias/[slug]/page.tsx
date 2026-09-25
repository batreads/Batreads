import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStories, getStoryBySlug, type Story } from "@/lib/notion";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getStories()).map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) return { title: "Historia no encontrada · Batreads" };

  return {
    title: `${story.title} · Batreads`,
    description: story.hook || story.synopsis,
    alternates: { canonical: `/historias/${story.slug}` },
  };
}

function score(value: number | null): string {
  return value === null ? "—" : String(value);
}

function paragraphs(value: string) {
  return value.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => (
    <p key={index}>{paragraph}</p>
  ));
}

function tagSection(title: string, values: string[]) {
  if (values.length === 0) return null;
  return (
    <section className="story-section">
      <h2>{title}</h2>
      <ul className="tag-list">{values.map((value) => <li key={value}>{value}</li>)}</ul>
    </section>
  );
}

function metricList(story: Story) {
  return [
    ["Darkness", story.darkness], ["Spice", story.spice],
    ["Toxicity", story.toxicity], ["Violence", story.violence],
    ["Impacto / WTF", story.impact],
  ] as const;
}

export default async function HistoriaPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) notFound();

  return (
    <main className="story-page">
      <Link className="back-link" href="/historias">← Todas las historias</Link>
      <header className="story-hero">
        {story.coverUrl ? <img className="story-cover" src={story.coverUrl} alt={`Portada de ${story.title}`} /> : null}
        <div>
          <p className="eyebrow">Ficha editorial</p>
          <h1>{story.title}</h1>
          {story.authorName ? <p className="story-author">de {story.authorName}</p> : null}
          {story.hook ? <p className="story-hook">{story.hook}</p> : null}
          {story.rating !== null ? <p className="story-rating">Nota Batreads: {score(story.rating)}</p> : null}
        </div>
      </header>

      {story.synopsis ? <section className="story-section"><h2>La historia</h2>{paragraphs(story.synopsis)}</section> : null}
      {story.review ? <section className="story-section"><h2>Reseña editorial</h2>{paragraphs(story.review)}</section> : null}

      <div className="story-columns">
        {story.idealFor ? <section className="story-section"><h2>Ideal para</h2>{paragraphs(story.idealFor)}</section> : null}
        {story.avoidIf ? <section className="story-section"><h2>Evita si</h2>{paragraphs(story.avoidIf)}</section> : null}
      </div>

      <section className="story-section">
        <h2>Dark Index</h2>
        <dl className="score-grid">{metricList(story).map(([label, value]) => (
          <div key={label}><dt>{label}</dt><dd>{score(value)}</dd></div>
        ))}</dl>
      </section>

      {tagSection("Tropes", story.tropes)}
      {tagSection("Dinámicas de relación", story.relationshipDynamics)}
      {tagSection("Subgéneros", story.subgenres)}
      {tagSection("Rasgos del interés amoroso", story.loveInterestTraits)}
      {(story.warnings.length > 0 || story.warningContext) ? (
        <section className="story-section story-warnings">
          <h2>Avisos de contenido</h2>
          {story.warnings.length > 0 ? <ul className="tag-list">{story.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : null}
          {story.warningContext ? paragraphs(story.warningContext) : null}
          <p>Los avisos pueden no ser exhaustivos.</p>
        </section>
      ) : null}

      <section className="story-section">
        <h2>Datos del libro</h2>
        <dl className="book-facts">
          {story.originalYear ? <div><dt>Año original</dt><dd>{story.originalYear}</dd></div> : null}
          {story.pageCount ? <div><dt>Páginas</dt><dd>{story.pageCount}</dd></div> : null}
          {story.publisher ? <div><dt>Editorial</dt><dd>{story.publisher}</dd></div> : null}
          {story.format.length ? <div><dt>Formatos</dt><dd>{story.format.join(", ")}</dd></div> : null}
        </dl>
        {story.officialUrl ? <p><a href={story.officialUrl} rel="noopener noreferrer" target="_blank">Web oficial ↗</a></p> : null}
        {story.amazonUrl ? <p><a href={story.amazonUrl} rel="sponsored noopener noreferrer" target="_blank">Ver en Amazon ↗</a></p> : null}
      </section>
    </main>
  );
}

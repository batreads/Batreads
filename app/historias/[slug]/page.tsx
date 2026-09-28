import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StoryGrid } from "../../_components/story-grid";
import { getAuthors, getSagas, getSeoPages, getStories, getStoryBySlug, storiesForSeoPage, type Story } from "@/lib/notion";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getStories()).map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let story: Story | null;
  try {
    story = await getStoryBySlug(slug);
  } catch {
    return { title: "Batreads", description: "Descubre tu próxima lectura en Batreads." };
  }
  if (!story) return { title: "Historia no encontrada · Batreads" };

  const title = `${story.title} · Batreads`;
  const description = story.hook || story.synopsis || `Descubre ${story.title} en Batreads y encuentra tu próxima lectura.`;
  const url = `/historias/${story.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article", siteName: "Batreads", locale: "es_ES" },
    twitter: { card: "summary_large_image", title, description },
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
    ["Oscuridad", story.darkness, "🌑"], ["Spice", story.spice, "🌶️"],
    ["Toxicidad", story.toxicity, "☠️"], ["Violencia", story.violence, "🔥"],
    ["WTF (trama)", story.impact, "🤯"],
  ] as const;
}

export default async function HistoriaPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) notFound();
  const [stories, authors, sagas, seoPages] = await Promise.all([getStories(), getAuthors(), getSagas(), getSeoPages()]);
  const author = authors.find((item) => item.id === story.authorId);
  const saga = sagas.find((item) => item.id === story.sagaId);
  const relatedStories = stories.filter((item) => item.id !== story.id && story.relatedStoryIds.includes(item.id));
  const authorNames = Object.fromEntries(authors.map((item) => [item.id, item.name]));
  const relatedPages = seoPages.filter((page) => storiesForSeoPage(page, stories, authors, sagas).some((item) => item.id === story.id));
  const heroOfficialUrl = story.officialUrl && story.officialUrl !== story.amazonUrl ? story.officialUrl : null;
  const isWattpad = heroOfficialUrl ? /^https?:\/\/(?:www\.)?wattpad\.com(?:\/|$)/i.test(heroOfficialUrl) : false;
  const heroActions = (story.amazonUrl || heroOfficialUrl) ? (
    <div className="story-hero-actions">
      {story.amazonUrl ? (
        <a className="story-hero-action story-hero-action-primary" href={story.amazonUrl} rel="sponsored noopener noreferrer" target="_blank">
          Comprar en Amazon
        </a>
      ) : null}
      {heroOfficialUrl ? (
        <a className={`story-hero-action ${story.amazonUrl ? "story-hero-action-secondary" : "story-hero-action-primary"}`} href={heroOfficialUrl} rel="noopener noreferrer" target="_blank">
          {isWattpad ? "Leer en Wattpad" : "Web oficial"}
        </a>
      ) : null}
    </div>
  ) : null;
  const kuNotice = story.kuSpain ? (
    <p className="story-hero-ku">
      <img src="/icons/book-open.svg" alt="" width="18" height="18" />
      Disponible en Kindle Unlimited
    </p>
  ) : null;

  return (
    <main className={`story-page${story.coverUrl ? "" : " story-page-no-cover"}`}>
      <aside className="story-sidebar" aria-label="Portada y opciones de lectura">
        <Link className="back-link" href="/historias">← Todos los libros</Link>
        {story.coverUrl ? (
          <div className="story-hero-media">
            <div className="story-hero-cover">
              <img src={story.coverUrl} alt={`Portada de ${story.title}`} />
            </div>
            {heroActions}
            {kuNotice}
          </div>
        ) : null}
      </aside>
      <div className="story-content">
      <header className="story-hero">
        <div className="story-hero-info">
          {story.rating !== null ? (
            <span className="story-hero-chip story-hero-chip-score">
              <img src="/icons/star.svg" alt="" width="18" height="18" />
              Puntuación de Batreads: {score(story.rating)}/5
            </span>
          ) : null}
          <h1>{story.title}</h1>
          {author ? <p className="story-hero-author">de <Link href={`/autoras/${author.slug}`}>{author.name}</Link></p>
            : story.authorName ? <p className="story-hero-author">de {story.authorName}</p> : null}
          {saga ? <p className="story-hero-saga">Saga: <Link href={`/sagas/${saga.slug}`}>{saga.name}</Link></p> : null}
          {story.tropes.length > 0 ? (
            <ul className="story-hero-tropes">
              {story.tropes.slice(0, 3).map((trope) => (
                <li key={trope}><img src="/icons/hero-ku.svg" alt="" width="14" height="14" />{trope}</li>
              ))}
            </ul>
          ) : null}
          {(story.hook || story.synopsis) ? <p className="story-hero-hook">{story.hook || story.synopsis}</p> : null}
          <div className="story-hero-metrics" aria-label="Índices del libro">
            {metricList(story).map(([label, value, icon]) => (
              <div className="story-hero-metric" key={label}>
                <div className="story-hero-metric-heading"><span aria-hidden="true">{icon}</span><strong>{score(value)}<em>/5</em></strong></div>
                <span className="story-hero-metric-label">{label}</span>
                <span className="story-hero-metric-track" aria-hidden="true"><span style={{ width: `${value === null ? 0 : Math.max(0, Math.min(100, value * 20))}%` }} /></span>
              </div>
            ))}
          </div>
          {!story.coverUrl ? <>{heroActions}{kuNotice}</> : null}
        </div>
      </header>

      {story.synopsis ? <section className="story-section"><h2>La historia</h2>{paragraphs(story.synopsis)}</section> : null}
      {story.review ? <section className="story-section"><h2>Reseña editorial</h2>{paragraphs(story.review)}</section> : null}

      <div className="story-columns">
        {story.idealFor ? <section className="story-section"><h2>Ideal para</h2>{paragraphs(story.idealFor)}</section> : null}
        {story.avoidIf ? <section className="story-section"><h2>Evita si</h2>{paragraphs(story.avoidIf)}</section> : null}
      </div>

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

      {relatedStories.length > 0 ? <section className="story-section home-story-cards"><h2>Historias relacionadas</h2><StoryGrid stories={relatedStories} authorNames={authorNames} headingLevel={3} /></section> : null}
      {relatedPages.length > 0 ? <section className="story-section"><h2>Listas y guías relacionadas</h2><ul className="link-list">{relatedPages.map((page) => <li key={page.id}><Link href={page.path}>{page.heading} →</Link></li>)}</ul></section> : null}

      <section className="story-section">
        <h2>Datos del libro</h2>
        <dl className="book-facts">
          {story.originalYear ? <div><dt>Año original</dt><dd>{story.originalYear}</dd></div> : null}
          {story.pageCount ? <div><dt>Páginas</dt><dd>{story.pageCount}</dd></div> : null}
          {story.publisher ? <div><dt>Editorial</dt><dd>{story.publisher}</dd></div> : null}
          {story.format.length ? <div><dt>Formatos</dt><dd>{story.format.join(", ")}</dd></div> : null}
        </dl>
        {heroOfficialUrl ? <p><a href={heroOfficialUrl} rel="noopener noreferrer" target="_blank">Web oficial ↗</a></p> : null}
        {story.amazonUrl ? <p><a href={story.amazonUrl} rel="sponsored noopener noreferrer" target="_blank">Ver en Amazon ↗</a></p> : null}
      </section>
      </div>
    </main>
  );
}

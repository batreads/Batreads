import { ListCard, ListCardGrid } from "@/app/_components/list-card";
import "../../_components/related-cards.css";
import "./story-typography.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../../_components/breadcrumbs";
import { notFound } from "next/navigation";
import { SagaCard } from "../../_components/saga-card";
import { BookRecommendations } from "../../_components/book-recommendations";
import { storyRecommendations } from "@/lib/story-recommendations";
import { getAuthors, getSagas, getSeoPages, getStories, getStoryBySlug, storiesForSeoPage, type Story } from "@/lib/notion";
import { EditorialImage } from "../../_components/editorial-image";
// import { BookSharing } from "../../_components/book-sharing";
import { storySeriesContext } from "@/lib/story-series-context";

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

  const title = story.seoTitle || `${story.title} · Batreads`;
  const description = story.metaDescription || story.hook || story.synopsis || `Descubre ${story.title} en Batreads y encuentra tu próxima lectura.`;
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
      <ul className="tag-list">{values.map((value) => <li key={value}><img src="/icons/tag.svg" alt="" width="14" height="14" />{value}</li>)}</ul>
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
  const seriesContext = storySeriesContext(story, saga);
  const sagaStories = saga ? stories.filter((item) => item.sagaId === saga.id)
    .sort((a, b) => (a.sagaNumber ?? Infinity) - (b.sagaNumber ?? Infinity)) : [];
  const isHiddenGem = story.filterValues["Popularidad"]?.some((value) => value.trim().toLocaleLowerCase("es") === "hidden gem");
  const recommendations = storyRecommendations(story, stories);
  const recommendationGroups = [
    { label: "En esta saga", stories: sagaStories }, ...recommendations,
  ].map((group) => ({ label: group.label, stories: group.stories
    .filter((item) => item.id !== story.id)
    .map(({ id, slug, title, coverUrl, authorName }) => ({ id, slug, title, coverUrl, authorName }))
  })).filter((group) => group.stories.length > 0);
  const relatedPages = seoPages.filter((page) =>
    page.mainStoryIds.includes(story.id)
    || storiesForSeoPage(page, stories, authors, sagas).some((item) => item.id === story.id)
  );
  const wattpadUrl = story.officialUrl && /^https?:\/\/(?:www\.)?wattpad\.com(?:\/|$)/i.test(story.officialUrl)
    ? story.officialUrl : null;
  const heroActions = (story.amazonUrl || wattpadUrl) ? (
    <div className="story-hero-actions">
      {story.amazonUrl ? (
        <a className="story-hero-action story-hero-action-primary" href={story.amazonUrl} rel="sponsored noopener noreferrer" target="_blank">
          Comprar en Amazon
        </a>
      ) : null}
      {wattpadUrl ? (
        <a className={`story-hero-action ${story.amazonUrl ? "story-hero-action-secondary" : "story-hero-action-primary"}`} href={wattpadUrl} rel="noopener noreferrer" target="_blank">
          Leer en Wattpad
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
  const heroTopline = isHiddenGem ? (
    <div className="story-hero-topline">
      <span className="story-hero-gem"><img src="/icons/gem.svg" alt="" width="16" height="16" />Hidden Gem</span>
    </div>
  ) : null;

  return (
    <main className={`story-page${story.coverUrl ? "" : " story-page-no-cover"}`}>
      <Breadcrumbs items={[{ label: "Libros", href: "/historias" }, { label: story.title }]} structuredDataPath={`/historias/${story.slug}`} />
      <div className="story-detail-layout">
      <aside className="story-sidebar" aria-label="Portada y opciones de lectura">
        {story.coverUrl ? (
          <div className="story-hero-media">
            <div className="story-hero-cover">
              <EditorialImage src={story.coverUrl} alt={`Portada de ${story.title}`} width={290} height={427}
                sizes="(max-width: 640px) 132px, 180px" loading="eager" fetchPriority="high" />
              {heroTopline ? <div className="story-cover-topline">{heroTopline}</div> : null}
            </div>
            {heroActions}
            {kuNotice}
          </div>
        ) : null}
      </aside>
      <div className="story-content">
      <header className="story-hero">
        <div className="story-hero-info">
          <h1>{story.title}</h1>
          <div className="story-hero-details">
            {(author || story.authorName) ? <p className="story-hero-author">
              <span className="story-hero-detail-label">Autora</span>
              {author ? <Link href={`/autoras/${author.slug}`}>{author.name}</Link> : story.authorName}
            </p> : null}
            {(saga || story.sagaName) ? <p className="story-hero-saga">
              <span className="story-hero-detail-label">Saga</span>
              {seriesContext.label ? <>{seriesContext.label} de </> : null}
              {saga ? <Link href={`/sagas/${saga.slug}`}>{saga.name}</Link> : story.sagaName}
            </p> : null}
          </div>
          {heroTopline}
          {(story.hook || story.synopsis) ? <p className="story-hero-hook">{story.hook || story.synopsis}</p> : null}
          {!story.coverUrl ? <>{heroActions}{kuNotice}</> : null}
        </div>
      </header>

      {heroActions ? <div className="story-mobile-purchase">{heroActions}{kuNotice}</div> : null}

      <section className="story-section story-intensity" aria-labelledby="story-intensity-title">
        <h2 id="story-intensity-title">Intensidad de la historia</h2>
          <div className="story-hero-metrics" aria-label="Índices del libro">
            {metricList(story).map(([label, value, icon]) => (
              <div className="story-hero-metric" key={label}>
                <div className="story-hero-metric-heading"><span aria-hidden="true">{icon}</span><strong>{score(value)}<em>/5</em></strong></div>
                <span className="story-hero-metric-label">{label}</span>
                <span className="story-hero-metric-track" aria-hidden="true"><span style={{ width: `${value === null ? 0 : Math.max(0, Math.min(100, value * 20))}%` }} /></span>
              </div>
            ))}
          </div>
      </section>

      {story.synopsis ? <section className="story-section"><h2>La historia</h2>{paragraphs(story.synopsis)}</section> : null}

      <div className="story-columns">
        {story.idealFor ? <section className="story-section"><h2><span className="story-fit-icon" aria-hidden="true">✓</span>Es para ti</h2>{paragraphs(story.idealFor)}</section> : null}
        {story.avoidIf ? <section className="story-section"><h2><span className="story-fit-icon story-fit-icon-avoid" aria-hidden="true">×</span>Evita si</h2>{paragraphs(story.avoidIf)}</section> : null}
      </div>

      {story.review ? <section className="story-section story-review"><h2>Reseña de Batreads</h2>{paragraphs(story.review)}</section> : null}

      <details className="story-section story-book-details">
        <summary>
          <h2>Datos del libro</h2>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </summary>
        <div className="story-book-details-content">
        <dl className="book-facts">
          {story.originalTitle ? <div><dt>Título original</dt><dd>{story.originalTitle}</dd></div> : null}
          {story.originalYear ? <div><dt>Año original</dt><dd>{story.originalYear}</dd></div> : null}
          <div><dt>Capítulos</dt><dd>{story.chapterCount ?? "—"}</dd></div>
          {story.pageCount ? <div><dt>Páginas</dt><dd>{story.pageCount}</dd></div> : null}
          {story.publisher ? <div><dt>Editorial</dt><dd>{story.publisher}</dd></div> : null}
          {story.format.length ? <div><dt>Formatos</dt><dd>{story.format.join(", ")}</dd></div> : null}
        </dl>
        {wattpadUrl ? <p><a href={wattpadUrl} rel="noopener noreferrer" target="_blank">Leer en Wattpad ↗</a></p> : null}
        {story.amazonUrl ? <p><a href={story.amazonUrl} rel="sponsored noopener noreferrer" target="_blank">Ver en Amazon ↗</a></p> : null}
        </div>
      </details>

      {tagSection("Tropes y temas recurrentes", story.tropes)}
      {tagSection("Dinámicas de relación", story.relationshipDynamics)}
      {tagSection("Subgéneros", story.subgenres)}
      {tagSection("Rasgos del interés amoroso", story.loveInterestTraits)}
      {(story.warnings.length > 0 || story.warningContext) ? (
        <section className="story-section story-warnings">
          <h2>Avisos de contenido</h2>
          {story.warnings.length > 0 ? <ul className="tag-list">{story.warnings.map((warning) => <li key={warning}><img src="/icons/tag.svg" alt="" width="14" height="14" />{warning}</li>)}</ul> : null}
          {story.warningContext ? paragraphs(story.warningContext) : null}
          <p>Los avisos pueden no ser exhaustivos.</p>
        </section>
      ) : null}

      {(saga || relatedPages.length > 0) ? (
        <section className="story-section story-discovery" aria-labelledby="story-discovery-title">
          <h2 id="story-discovery-title">{saga ? relatedPages.length > 0 ? "Saga y listas relacionadas" : "La saga" : "Listas relacionadas"}</h2>
          <div className="story-discovery-cards">
            {saga ? <SagaCard saga={saga} stories={sagaStories} headingLevel={3} showAuthor={false} linkLabel="Ver la saga"
              showGenre={false} showRelationshipTags={false} /> : null}
            {relatedPages.length > 0 ? <ListCardGrid>{relatedPages.map((page) => <ListCard page={page} stories={stories} key={page.id} />)}</ListCardGrid> : null}
          </div>
        </section>
      ) : null}


      {recommendationGroups.length > 0 ? (
        <section className="story-section story-explore" aria-labelledby="story-explore-title">
          <div className="story-explore-results">
          <header className="story-explore-heading">
            <h2 id="story-explore-title">Libros relacionados</h2>
          </header>
          <BookRecommendations groups={recommendationGroups} />
          </div>
        </section>
      ) : null}
      {/* <BookSharing book={{
        id: story.id,
        slug: story.slug,
        title: story.title,
        authorName: author?.name || story.authorName,
        spice: story.spice,
        tropes: story.tropes,
        subgenres: story.subgenres,
        idealFor: story.idealFor,
      }} /> */}
      </div>
      </div>

    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../_components/breadcrumbs";
import { StoryCardRating } from "../../_components/story-card-rating";
import { getAuthors, getSagaBySlug, getSagas, getSeoPages, getStories, type Story } from "@/lib/notion";
import "./saga.css";

type PageProps = { params: Promise<{ slug: string }> };

function paragraphs(value: string): string[] {
  return value.split(/(?:<br\s*\/?>\s*){2,}|\n\s*\n/i)
    .map((part) => part.replace(/<br\s*\/?>/gi, " ").trim())
    .filter(Boolean);
}

export async function generateStaticParams() {
  return (await getSagas()).map((saga) => ({ slug: saga.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const saga = await getSagaBySlug((await params).slug);
  return saga
    ? {
        title: saga.seoTitle || `${saga.name} · Batreads`,
        description: saga.metaDescription || saga.intro || saga.description,
        alternates: { canonical: `/sagas/${saga.slug}` },
      }
    : { title: "Saga no encontrada · Batreads" };
}

function SagaBook({ story, number, title }: { story: Story | null; number: number; title?: string }) {
  if (!story) return (
    <article className="saga-book saga-book-pending">
      <div className="saga-book-art saga-book-art-pending" aria-hidden="true">
        <span className="saga-book-number">{number.toString().padStart(2, "0")}</span>
        <span className="saga-book-cover saga-book-cover-pending" />
      </div>
      <div className="saga-book-copy">
        <p className="saga-kicker">Libro {number}</p>
        <h3>{title || "Título por confirmar"}</h3>
        <p className="saga-book-hook">Todavía no tenemos una ficha de este libro en Batreads.</p>
        {title ? <p className="saga-book-state">Sin ficha en Batreads</p> : null}
      </div>
    </article>
  );

  return (
    <article className="saga-book">
      <div className="saga-book-art">
        <span className="saga-book-number" aria-hidden="true">{number.toString().padStart(2, "0")}</span>
        <Link className="saga-book-cover" href={`/historias/${story.slug}`} aria-label={`Ver ficha de ${story.title}`}>
          {story.coverUrl ? <img src={story.coverUrl} alt={`Portada de ${story.title}`} /> : <span>Batreads</span>}
        </Link>
      </div>
      <div className="saga-book-copy">
        <p className="saga-kicker">Libro {number}</p>
        <h3><Link href={`/historias/${story.slug}`}>{story.title}</Link></h3>
        {story.rating !== null ? <StoryCardRating rating={story.rating} /> : null}
        {story.hook ? <p className="saga-book-hook">{story.hook}</p> : null}
        {story.subgenres[0] || story.tropes[0] ? (
          <div className="story-card-taxonomy saga-book-tags">
            {story.subgenres[0] ? <span className="story-card-tag" aria-label={`Subgénero: ${story.subgenres[0]}`}><img src="/icons/tag.svg" alt="" width="12" height="12" />{story.subgenres[0]}</span> : null}
            {story.tropes[0] ? <span className="story-card-tag" aria-label={`Trope: ${story.tropes[0]}`}><img src="/icons/tag.svg" alt="" width="12" height="12" />{story.tropes[0]}</span> : null}
          </div>
        ) : null}
        <div className="saga-actions">
          <Link className="saga-button saga-button-primary" href={`/historias/${story.slug}`}>Ver ficha <span aria-hidden="true">→</span></Link>
          {story.amazonUrl ? <a className="saga-button" href={story.amazonUrl} target="_blank" rel="noopener noreferrer">Amazon <span aria-hidden="true">↗</span></a> : null}
        </div>
      </div>
    </article>
  );
}

export default async function SagaPage({ params }: PageProps) {
  const { slug } = await params;
  const [saga, stories, authors, seoPages] = await Promise.all([getSagaBySlug(slug), getStories(), getAuthors(), getSeoPages()]);
  if (!saga) notFound();

  const sagaStories = stories.filter((story) => story.sagaId === saga.id)
    .sort((a, b) => (a.sagaNumber ?? Number.MAX_SAFE_INTEGER) - (b.sagaNumber ?? Number.MAX_SAFE_INTEGER) || a.title.localeCompare(b.title, "es"));
  const sagaAuthors = authors.filter((author) => saga.authorIds.includes(author.id) || sagaStories.some((story) => story.authorId === author.id));
  const sagaPages = seoPages.filter((page) => page.sagaIds.includes(saga.id));
  const firstBook = sagaStories[0];
  const total = Math.max(saga.bookCount ?? 0, saga.bookTitles.length, sagaStories.length);
  const hasProgress = total > 0 && sagaStories.length > 0 && sagaStories.length <= total;
  const covers = sagaStories.filter((story) => story.coverUrl).slice(0, 3);
  const numberedStories = new Map(sagaStories.filter((story) => story.sagaNumber !== null).map((story) => [story.sagaNumber, story]));
  const unnumberedStories = sagaStories.filter((story) => story.sagaNumber === null);
  const slotCount = Math.max(total, ...sagaStories.map((story) => story.sagaNumber ?? 0));
  const bookSlots = Array.from({ length: slotCount }, (_, index) => numberedStories.get(index + 1) ?? unnumberedStories.shift() ?? null);

  return (
    <main className="catalog-page saga-page">
      <Breadcrumbs items={[{ label: "Sagas", href: "/sagas" }, { label: saga.name }]} />

      <header className="saga-hero">
        <div className="saga-hero-copy">
          <p className="saga-kicker">{saga.sagaType || "Saga"}{sagaAuthors.length > 0 ? ` · ${sagaAuthors.map((author) => author.name).join(", ")}` : ""}</p>
          <h1>{saga.name}</h1>
          {saga.intro ? <div className="saga-hero-intro">{paragraphs(saga.intro).map((part) => <p key={part}>{part}</p>)}</div> : null}
          <ul className="story-hero-tropes saga-tags">
            {saga.spanishAvailability ? <li><img src="/icons/hero-ku.svg" alt="" width="14" height="14" />Español: {saga.spanishAvailability.toLowerCase()}</li> : null}
            {saga.readingOrder ? <li><img src="/icons/hero-ku.svg" alt="" width="14" height="14" />Orden {saga.readingOrder.toLowerCase()}</li> : null}
            {saga.standalone === "Sí" ? <li><img src="/icons/hero-ku.svg" alt="" width="14" height="14" />Autoconclusivos</li> : null}
            {saga.bookRelationship ? <li><img src="/icons/hero-ku.svg" alt="" width="14" height="14" />{saga.bookRelationship}</li> : null}
          </ul>
          <div className="saga-actions">
            {firstBook ? <Link className="saga-button saga-button-primary" href={`/historias/${firstBook.slug}`}>Empezar la saga <span aria-hidden="true">→</span></Link> : null}
            {sagaStories.length > 0 ? <a className="saga-button" href="#orden">Ver orden de lectura <span aria-hidden="true">↓</span></a> : null}
          </div>
        </div>
        <div className="saga-hero-art" aria-label="Portadas de los libros de la saga">
          {saga.coverUrl ? <img className="saga-main-cover" src={saga.coverUrl} alt={`Portada de ${saga.name}`} /> : covers.length > 0 ? (
            <div className={`saga-cover-stack saga-cover-stack-${covers.length}`}>
              {covers.map((story) => <img key={story.id} src={story.coverUrl!} alt={`Portada de ${story.title}`} />)}
            </div>
          ) : <span className="saga-art-monogram" aria-hidden="true">{saga.name.slice(0, 1)}</span>}
        </div>
      </header>

      <dl className="saga-facts">
        {saga.status ? <div><dt>Estado</dt><dd>{saga.status}</dd></div> : null}
        {total > 0 ? <div><dt>Libros</dt><dd>{total} {total === 1 ? "libro" : "libros"}</dd></div> : null}
        {saga.spanishAvailability ? <div><dt>En español</dt><dd>{saga.spanishAvailability}</dd></div> : null}
        {saga.kindleUnlimited ? <div><dt>Kindle Unlimited</dt><dd>{saga.kindleUnlimited}</dd></div> : null}
      </dl>

      {saga.description ? (
        <section className="saga-section saga-intro-section">
          <p className="saga-kicker">La historia detrás de los libros</p>
          <h2>Sobre {saga.name}</h2>
          {paragraphs(saga.description).map((part) => <p key={part}>{part}</p>)}
          {sagaAuthors.length > 0 ? <div className="saga-inline-links">{sagaAuthors.map((author) => <Link key={author.id} href={`/autoras/${author.slug}`}>Conoce a {author.name} <span aria-hidden="true">→</span></Link>)}</div> : null}
        </section>
      ) : null}

      {bookSlots.length > 0 ? (
          <section className="saga-section" id="orden">
            <div className="saga-section-heading"><div><p className="saga-kicker">Tu ruta por la saga</p><h2>Libros de {saga.name} en orden</h2></div>{saga.readingOrder ? <span className="saga-heading-note">Orden de lectura: {saga.readingOrder.toLowerCase()}</span> : null}</div>
            {saga.whyReadInOrder ? <div className="saga-order-explainer">{paragraphs(saga.whyReadInOrder).map((part) => <p key={part}>{part}</p>)}</div> : null}
            {hasProgress ? <div className="saga-progress" aria-label={`${sagaStories.length} de ${total} fichas disponibles en Batreads`}><strong>{sagaStories.length}<span> / {total}</span></strong><span>fichas disponibles en Batreads</span><div className="saga-progress-track"><span style={{ width: `${Math.min(100, sagaStories.length / total * 100)}%` }} /></div></div> : null}
            <div className="saga-books" id="libros">{bookSlots.map((story, index) => <SagaBook key={story?.id ?? `pending-${index}`} story={story} number={index + 1} title={saga.bookTitles[index]} />)}</div>
          </section>
      ) : null}

      {saga.faqs.length > 0 ? <section className="saga-section"><p className="saga-kicker">Resolvemos tus dudas</p><h2>Preguntas frecuentes</h2><div className="saga-faq">{saga.faqs.map(({ question, answer }) => <div className="saga-faq-item" key={question}><h3>{question}</h3><p>{answer}</p></div>)}</div></section> : null}

      {sagaPages.length > 0 ? <section className="saga-section"><p className="saga-kicker">Sigue explorando</p><h2>Listas y guías</h2><div className="saga-inline-links">{sagaPages.map((page) => <Link key={page.id} href={page.path}>{page.heading} <span aria-hidden="true">→</span></Link>)}</div></section> : null}
    </main>
  );
}

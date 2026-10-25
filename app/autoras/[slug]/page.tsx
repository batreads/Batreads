import { ListCard } from "@/app/_components/list-card";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../_components/breadcrumbs";
import { StoryGrid } from "../../_components/story-grid";
import { SagaCard } from "../../_components/saga-card";
import { EditorialContent } from "../../_components/editorial-list-content";
import { AuthorIndex } from "../../_components/author-index";
import { getAuthorBySlug, getAuthors, getEditorialBlocks, getSagas, getSeoPages, getStories } from "@/lib/notion";
import type { Author, SeoPage } from "@/lib/notion";
import { authorDescription } from "@/lib/seo-metadata";
import { sortByReadingGuide } from "@/lib/author-reading-order";

type PageProps = { params: Promise<{ slug: string }> };

function verifiedDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}/.test(value)) return null;
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat("es-ES", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  }).format(date);
}

function externalUrl(value: string | null) {
  return value && /^https?:\/\//i.test(value) ? value : null;
}

function isPublicCollection(page: SeoPage) {
  return page.section === "listas"
    && page.hasExplicitPath
    && (page.pageType === "Colección" || page.pageType === "CollectionLanding")
    && (page.pageFormat === "Colección dinámica" || page.dynamicCollection);
}

function featuredCollection(author: Author, pages: SeoPage[]): SeoPage | null {
  const explicit = pages.find((page) => page.id === author.featuredCollectionId);
  if (explicit && explicit.section === "listas") return explicit;

  const specialties = author.specialties.map((value) => value.trim().toLocaleLowerCase("es"));
  const candidates = pages.filter((page) => {
    const filter = page.filter1;
    return isPublicCollection(page)
      && page.dynamicCollection
      && filter.field === "Subgénero"
      && ["es", "contiene"].includes(filter.operator)
      && specialties.includes(filter.value.trim().toLocaleLowerCase("es"));
  });
  if (candidates.length === 0) return null;
  // A longer exact specialty is more specific; equal scores stay unresolved.
  const ranked = candidates.sort((a, b) => b.filter1.value.length - a.filter1.value.length || (b.priority ?? -1) - (a.priority ?? -1));
  const first = ranked[0];
  const second = ranked[1];
  if (second && first.filter1.value.length === second.filter1.value.length && first.priority === second.priority) return null;
  return first;
}

function relatedLists(author: Author, pages: SeoPage[]): SeoPage[] {
  const explicit = pages
    .filter((page) => page.section === "listas" && page.authorIds.includes(author.id))
    .sort((a, b) => (b.priority ?? -1) - (a.priority ?? -1) || a.heading.localeCompare(b.heading, "es"));
  const featured = featuredCollection(author, pages);

  return featured
    ? [featured, ...explicit.filter((page) => page.id !== featured.id)]
    : explicit;
}

export async function generateStaticParams() {
  return (await getAuthors()).map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const author = await getAuthorBySlug((await params).slug);
  if (!author) return { title: "Autora no encontrada · Batreads" };

  const title = author.seoTitle || `${author.name} · Batreads`;
  const description = authorDescription(author);
  return {
    title,
    description,
    alternates: { canonical: `/autoras/${author.slug}` },
    openGraph: {
      title,
      description,
      url: `/autoras/${author.slug}`,
      siteName: "Batreads",
      type: "website",
      locale: "es_ES",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function AutoraPage({ params }: PageProps) {
  const { slug } = await params;
  const authorPromise = getAuthorBySlug(slug);
  const editorialPromise = authorPromise.then(author => author ? getEditorialBlocks(author.id) : []);
  const [author, stories, sagas, seoPages, editorialBlocks] = await Promise.all([
    authorPromise, getStories(), getSagas(), getSeoPages(), editorialPromise,
  ]);
  if (!author) notFound();

  const notionPathsById = Object.fromEntries([
    [author.id.replaceAll("-", ""), `/autoras/${author.slug}`],
    ...stories.map((story) => [story.id.replaceAll("-", ""), `/historias/${story.slug}`]),
    ...sagas.map((saga) => [saga.id.replaceAll("-", ""), `/sagas/${saga.slug}`]),
    ...seoPages.map((page) => [page.id.replaceAll("-", ""), page.path]),
  ]);
  const relatedStoryIds = new Set(author.storyIds);
  const authorStories = sortByReadingGuide(stories.filter((story) => relatedStoryIds.has(story.id)), editorialBlocks);
  const relatedSagaIds = new Set(author.sagaIds);
  const authorSagas = sagas.filter((saga) => relatedSagaIds.has(saga.id));
  const relatedListsForAuthor = relatedLists(author, seoPages);
  const amazonUrl = externalUrl(author.amazonUrl);
  const socials = [
    ["Instagram", author.instagram], ["TikTok", author.tiktok], ["Wattpad", author.wattpad],
    ["Goodreads", author.goodreads], ["Web", author.website],
  ] as const;
  const heroTags = [...new Map(
    [...author.specialties, ...authorStories.flatMap((story) => story.subgenres)]
      .map((value) => [value.trim().toLocaleLowerCase("es"), value.trim()]),
  ).values()].filter(Boolean);
  const facts = [
    ["País", author.country.join(", ")],
    ["Especialidades", author.specialties.join(", ")],
    ["Publicación", author.publicationTypes.join(", ")],
    ["Sagas", authorSagas.map((saga) => saga.name).join(", ")],
  ].filter(([, value]) => Boolean(value));
  const indexItems = [
    ...(editorialBlocks.length ? [{ id: "orden-de-lectura", title: "Orden de lectura" }] : []),
    { id: "author-stories-title", title: "Libros" },
    ...(authorSagas.length || relatedListsForAuthor.length ? [{ id: "author-sagas-title", title: authorSagas.length && relatedListsForAuthor.length ? "Sagas y listas" : authorSagas.length ? "Sagas" : "Listas relacionadas" }] : []),
    ...(author.faqs.length ? [{ id: "author-faqs-title", title: "Preguntas frecuentes" }] : []),
    ...(author.bio || socials.some(([, url]) => externalUrl(url)) ? [{ id: "author-about-title", title: "Biografía" }] : []),
  ];

  return (
    <main className="catalog-page author-page">
      <Breadcrumbs items={[{ label: "Autoras", href: "/autoras" }, { label: author.name }]} structuredDataPath={`/autoras/${author.slug}`} />

      <header className={`author-hero${author.photoUrl ? " author-hero-with-photo" : ""}`}>
        <div className="author-hero-copy">
          <h1>{author.name}</h1>
          {author.intro ? <p className="author-intro">{author.intro}</p> : null}
          <div className="author-hero-toolbar">
          {heroTags.length > 0 ? (
            <div className="author-chips">
              {heroTags.map((value) => (
                <span className="story-card-tag" key={value}>
                  <img src="/icons/tag.svg" alt="" width="12" height="12" />
                  {value}
                </span>
              ))}
            </div>
          ) : null}
          </div>
        </div>
        {author.photoUrl ? <img className="author-portrait" src={author.photoUrl} alt={`Retrato de ${author.name}`} /> : null}
      </header>

      <AuthorIndex name={author.name} items={indexItems}>
      {editorialBlocks.length > 0 ? (
        <section id="orden-de-lectura" className="story-section author-editorial" aria-label={`Guía de lectura de ${author.name}`}>
          <EditorialContent blocks={editorialBlocks} notionPathsById={notionPathsById} stories={authorStories} authorReading />
        </section>
      ) : null}
      <section className="story-section home-story-cards author-stories" id="historias" aria-labelledby="author-stories-title">
        <div className="author-section-heading">
          <div>
            <h2 id="author-stories-title">Libros de {author.name}</h2>
          </div>
          <div className="author-section-actions">
            {amazonUrl ? <a href={amazonUrl} target="_blank" rel="noopener noreferrer">Ver libros en Amazon ↗</a> : null}
          </div>
        </div>
        <StoryGrid stories={authorStories} authorNames={{ [author.id]: author.name }} headingLevel={3} />
      </section>

      {authorSagas.length > 0 || relatedListsForAuthor.length > 0 ? (
        <section className="story-section author-sagas" aria-labelledby="author-sagas-title">
          <div className="author-section-heading">
            <h2 id="author-sagas-title">{authorSagas.length && relatedListsForAuthor.length ? "Sagas y listas relacionadas" : authorSagas.length ? "Sagas" : "Listas relacionadas"}</h2>
            {amazonUrl ? <div className="author-section-actions"><a href={amazonUrl} target="_blank" rel="noopener noreferrer">Ver libros en Amazon ↗</a></div> : null}
          </div>
          <div className="author-related-grid">
            {authorSagas.map((saga) => {
              const sagaStoryIds = new Set(saga.storyIds);
              return <SagaCard key={saga.id} saga={saga} stories={stories.filter((story) => sagaStoryIds.has(story.id))} showAuthor={false} showGenre={false} showDiscovery={false} showLink={false} showRelationshipTags={false} headingLevel={3} />;
            })}
            {relatedListsForAuthor.map((page) => <ListCard page={page} stories={stories} key={page.id} />)}
          </div>
        </section>
      ) : null}

      {author.faqs.length > 0 ? (
        <section className="story-section author-faqs" aria-labelledby="author-faqs-title">
          <h2 id="author-faqs-title">Preguntas frecuentes sobre {author.name}</h2>
          <div className="author-faq-list">
            {author.faqs.map(({ question, answer }, index) => (
              <div className="author-faq-item" key={`${index}-${question}`}>
                <h3>{question}</h3>
                <p>{answer}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {author.bio || socials.some(([, url]) => externalUrl(url)) ? (
        <section className="story-section author-about" aria-labelledby="author-about-title">
          <h2 id="author-about-title">Sobre {author.name}</h2>
          {amazonUrl ? <div className="author-about-cta author-socials"><a className="author-amazon-cta" href={amazonUrl} target="_blank" rel="noopener noreferrer">Ver libros en Amazon ↗</a></div> : null}
          <div className="author-biography">
            {author.bio ? <p className="author-bio">{author.bio}</p> : null}

          </div>
          {facts.length > 0 || amazonUrl || socials.some(([, url]) => externalUrl(url)) ? (
            <aside className="author-facts" aria-label={`Ficha de ${author.name}`}>
              {facts.map(([label, value]) => <div className="author-fact" key={label}><span>{label}</span><strong>{value}</strong></div>)}
            {socials.some(([, url]) => externalUrl(url)) ? <nav className="author-profile-links" aria-label={`Redes y web de ${author.name}`}>
              <p className="author-profile-links-title">Web y redes sociales</p>
              {socials.map(([label, url]) => externalUrl(url) ? <a key={label} href={url!} target="_blank" rel="noopener noreferrer" aria-label={`${label} de ${author.name} (abre en otra pestaña)`}>{label} ↗</a> : null)}
            </nav> : null}
            </aside>
          ) : null}
        </section>
      ) : null}

      </AuthorIndex>
    </main>
  );
}

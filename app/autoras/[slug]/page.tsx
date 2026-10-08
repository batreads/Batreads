import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../_components/breadcrumbs";
import { StoryGrid } from "../../_components/story-grid";
import { SagaCard } from "../../_components/saga-card";
import { getAuthorBySlug, getAuthors, getSagas, getSeoPages, getStories } from "@/lib/notion";
import type { Author, SeoPage } from "@/lib/notion";
import { authorDescription } from "@/lib/seo-metadata";

type PageProps = { params: Promise<{ slug: string }> };

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

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
  const [author, stories, sagas, seoPages] = await Promise.all([getAuthorBySlug(slug), getStories(), getSagas(), getSeoPages()]);
  if (!author) notFound();

  const relatedStoryIds = new Set(author.storyIds);
  const authorStories = stories.filter((story) => relatedStoryIds.has(story.id));
  const relatedSagaIds = new Set(author.sagaIds);
  const authorSagas = sagas.filter((saga) => relatedSagaIds.has(saga.id));
  const relatedListsForAuthor = relatedLists(author, seoPages);
  const date = verifiedDate(author.verifiedAt);
  const amazonUrl = externalUrl(author.amazonUrl);
  const socials = [
    ["Instagram", author.instagram], ["TikTok", author.tiktok], ["Wattpad", author.wattpad],
    ["Goodreads", author.goodreads], ["Web", author.website],
  ] as const;
  const heroTags = [...author.specialties, ...author.publicationTypes];
  const facts = [
    ["País", author.country.join(", ")],
    ["Especialidades", author.specialties.join(", ")],
    ["Publicación", author.publicationTypes.join(", ")],
    ["Sagas", authorSagas.map((saga) => saga.name).join(", ")],
    ["Datos verificados", date],
  ].filter(([, value]) => Boolean(value));

  return (
    <main className="catalog-page author-page">
      <Breadcrumbs items={[{ label: "Autoras", href: "/autoras" }, { label: author.name }]} structuredDataPath={`/autoras/${author.slug}`} />

      <header className={`author-hero${author.photoUrl ? " author-hero-with-photo" : ""}`}>
        <div className="author-hero-copy">
          <p className="eyebrow">Autora</p>
          <h1>{author.name}</h1>
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
          {author.intro ? <p className="author-intro">{author.intro}</p> : null}
          <div className="author-hero-meta">
            <span>{countLabel(author.storyCount ?? authorStories.length, "historia", "historias")} en Batreads</span>
            {authorSagas.length > 0 ? <span>{countLabel(authorSagas.length, "saga", "sagas")}</span> : null}
            {date ? <span>Datos verificados · {date}</span> : null}
          </div>
          {socials.some(([, url]) => externalUrl(url)) || amazonUrl ? (
            <nav className="author-socials" aria-label={`Enlaces de ${author.name}`}>
              {amazonUrl ? <a className="author-amazon-cta" href={amazonUrl} target="_blank" rel="noopener noreferrer" aria-label={`Buscar libros de ${author.name} en Amazon (abre en otra pestaña)`}>Amazon</a> : null}
              {socials.map(([label, url]) => externalUrl(url) ? <a key={label} href={url!} target="_blank" rel="noopener noreferrer" aria-label={`${label} de ${author.name} (abre en otra pestaña)`}>{label} ↗</a> : null)}
            </nav>
          ) : null}
        </div>
        {author.photoUrl ? <img className="author-portrait" src={author.photoUrl} alt={`Retrato de ${author.name}`} /> : null}
      </header>

      <section className="story-section home-story-cards author-stories" id="historias" aria-labelledby="author-stories-title">
        <div className="author-section-heading">
          <div>
            <h2 id="author-stories-title">Historias de {author.name} en Batreads</h2>
            <p className="author-catalog-note">En Batreads solo mostramos las historias que hemos añadido y clasificado. La autora puede tener más obras publicadas.</p>
          </div>
          <div className="author-section-actions">
            {amazonUrl ? <a href={amazonUrl} target="_blank" rel="noopener noreferrer">Buscar libros de {author.name} en Amazon ↗</a> : null}
          </div>
        </div>
        <StoryGrid stories={authorStories} authorNames={{ [author.id]: author.name }} headingLevel={3} />
      </section>

      {authorSagas.length > 0 ? (
        <section className="story-section author-sagas" aria-labelledby="author-sagas-title">
          <h2 id="author-sagas-title">Sagas</h2>
          <div className="saga-card-grid">
            {authorSagas.map((saga) => {
              const sagaStoryIds = new Set(saga.storyIds);
              return <SagaCard key={saga.id} saga={saga} stories={stories.filter((story) => sagaStoryIds.has(story.id))} authorName={author.name} headingLevel={3} />;
            })}
          </div>
        </section>
      ) : null}

      {author.bio ? (
        <section className="story-section author-about" aria-labelledby="author-about-title">
          <h2 id="author-about-title">Sobre {author.name}</h2>
          <p className="author-bio">{author.bio}</p>
          {facts.length > 0 || amazonUrl ? (
            <aside className="author-facts" aria-label={`Ficha de ${author.name}`}>
              {facts.map(([label, value]) => <div className="author-fact" key={label}><span>{label}</span><strong>{value}</strong></div>)}
              {amazonUrl ? <a href={amazonUrl} target="_blank" rel="noopener noreferrer">Buscar libros en Amazon ↗</a> : null}
            </aside>
          ) : null}
        </section>
      ) : null}

      {relatedListsForAuthor.length > 0 ? (
        <section className="story-section author-discover" aria-labelledby="author-discover-title">
          <p className="eyebrow">Sigue explorando</p>
          <h2 id="author-discover-title">Listas relacionadas con {author.name}</h2>
          <div className="author-discover-grid">
            {relatedListsForAuthor.map((page) => (
              <Link className="home-list-card author-discover-card" href={page.path} key={page.id}>
                <span className="home-list-card-label">Selección editorial</span>
                <h3>{page.contentTitle}</h3>
                {page.summary ? <p>{page.summary}</p> : null}
                <span className="author-discover-action">Explorar lista →</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

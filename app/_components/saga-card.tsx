import Link from "next/link";
import type { Author, Saga, Story } from "@/lib/notion";
import { EditorialImage } from "./editorial-image";
import "./saga-card.css";

function LinkChevron() {
  return <svg className="saga-card-chevron" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="m6 3 5 5-5 5" /></svg>;
}

export function SagaCard({ saga, stories, authorName, authors = [], showDiscovery = false, headingLevel = 2, showArt = true, showGenre = true, showRelationshipTags = true, showLink = true }: {
  saga: Saga;
  stories: Story[];
  authorName?: string;
  authors?: Author[];
  showDiscovery?: boolean;
  headingLevel?: 2 | 3;
  showArt?: boolean;
  showGenre?: boolean;
  showRelationshipTags?: boolean;
  showLink?: boolean;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const orderedStories = [...stories].sort((a, b) => (a.sagaNumber ?? Infinity) - (b.sagaNumber ?? Infinity) || a.title.localeCompare(b.title, "es"));
  const covers = orderedStories.filter((story) => story.coverUrl).slice(0, 3);
  const count = Math.max(saga.bookCount ?? 0, saga.bookTitles.length);
  const byline = authorName || [...new Set(stories.map((story) => story.authorName).filter(Boolean))].join(", ");
  const genre = stories.flatMap((story) => story.subgenres)
    .find((value) => value.trim().toLocaleLowerCase("es") !== "dark romance") ?? saga.sagaType;
  const sourceDescription = (saga.intro || saga.description).replace(/<br\s*\/?>/gi, " ").trim();
  const description = sourceDescription;
  const sagaAuthors = authors.filter((author) => saga.authorIds.includes(author.id) || stories.some((story) => story.authorId === author.id));
  const linkedAuthorNames = new Set(sagaAuthors.map((author) => author.name));
  const otherAuthorNames = [...new Set(stories.map((story) => story.authorName).filter((name): name is string => Boolean(name) && !linkedAuthorNames.has(name!)))];
  const normalizeTitle = (title: string) => title.trim().toLocaleLowerCase("es");
  const firstBook = orderedStories.find((story) => story.sagaNumber === 1)
    ?? orderedStories.find((story) => Boolean(saga.bookTitles[0]) && story.sagaNumber === null && (
      normalizeTitle(story.title) === normalizeTitle(saga.bookTitles[0])
      || Boolean(story.originalTitle) && normalizeTitle(story.originalTitle) === normalizeTitle(saga.bookTitles[0])
    ));
  const sagaPath = `/sagas/${saga.slug}`;

  return (
    <article className={`saga-card${showArt ? "" : " saga-card-no-art"}`}>
      {showArt ? <Link className="saga-card-art" href={sagaPath} aria-label={`Ver ${saga.name}: libros y orden de lectura`}>
        {saga.coverUrl ? <EditorialImage className="saga-card-feature-cover" src={saga.coverUrl} alt="" width={200} height={300}
          sizes="(max-width: 600px) 150px, 200px" loading="lazy" /> : covers.length > 0 ? (
          <div className={`saga-card-covers saga-card-covers-${covers.length}`}>
            {covers.map((story) => <EditorialImage src={story.coverUrl!} alt="" width={142} height={205}
              sizes="(max-width: 600px) 126px, 142px" loading="lazy" key={story.id} />)}
          </div>
        ) : <span className="saga-card-monogram">{saga.name.slice(0, 1)}</span>}
        <span className="saga-card-count">
          <img src="/icons/book-open.svg" alt="" width="18" height="18" />
          {count > 0 ? `${count} ${count === 1 ? "libro" : "libros"}` : `${stories.length} ${stories.length === 1 ? "ficha" : "fichas"} en Batreads`}
        </span>
      </Link> : null}
      <div className="saga-card-body">
        <Heading><Link className="saga-card-primary-link" href={sagaPath}>{saga.name}</Link></Heading>
        {sagaAuthors.length > 0 ? <p className="saga-card-author">
          {sagaAuthors.map((author, index) => <span key={author.id}>{index > 0 ? ", " : ""}<Link href={`/autoras/${author.slug}`}>{author.name}</Link></span>)}
          {otherAuthorNames.length > 0 ? `, ${otherAuthorNames.join(", ")}` : null}
        </p> : byline ? <p className="saga-card-author">{byline}</p> : null}
        {description ? <p className="saga-card-description">{description}</p> : null}
        {showGenre && genre || showRelationshipTags && (saga.standalone === "Sí" || saga.bookRelationship) ? (
          <div className="saga-card-tags">
            {showGenre && genre ? <span><img src="/icons/tag.svg" alt="" width="12" height="12" />{genre}</span> : null}
            {showRelationshipTags && saga.standalone === "Sí" ? <span><img src="/icons/tag.svg" alt="" width="12" height="12" />Autoconclusivos</span> : null}
            {showRelationshipTags && saga.bookRelationship ? <span><img src="/icons/tag.svg" alt="" width="12" height="12" />{saga.bookRelationship}</span> : null}
          </div>
        ) : null}
        {showLink || showDiscovery && orderedStories.length > 0 ? <div className="saga-card-actions">
          {showLink ? <Link className="saga-card-link" href={sagaPath}>Ver libros y orden de lectura <LinkChevron /></Link> : null}
          {showDiscovery && orderedStories.length > 0 ? <div className="saga-card-books">
            {(firstBook ? [firstBook] : orderedStories.slice(0, 2)).map((story) => <Link className="saga-card-book" href={`/historias/${story.slug}`} key={story.id}>
              {story.coverUrl ? <span className="saga-card-book-art" aria-hidden="true"><EditorialImage className="saga-card-book-cover" src={story.coverUrl} alt="" width={36} height={54} sizes="36px" loading="lazy" /></span> : null}
              <span className="saga-card-book-copy">
                <span className="saga-card-book-label">{firstBook ? "Por dónde empezar:" : "Libros disponibles en Batreads"}</span>
                <span className="saga-card-book-title">{story.title} <LinkChevron /></span>
              </span>
            </Link>)}
          </div> : null}
        </div> : null}
      </div>
    </article>
  );
}

import Link from "next/link";
import type { Saga, Story } from "@/lib/notion";
import { EditorialImage } from "./editorial-image";
import "./saga-card.css";

export function SagaCard({ saga, stories, authorName, headingLevel = 2, showArt = true, showGenre = true, showLink = true }: {
  saga: Saga;
  stories: Story[];
  authorName?: string;
  headingLevel?: 2 | 3;
  showArt?: boolean;
  showGenre?: boolean;
  showLink?: boolean;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const covers = stories.filter((story) => story.coverUrl).slice(0, 3);
  const count = saga.bookCount ?? stories.length;
  const byline = authorName || [...new Set(stories.map((story) => story.authorName).filter(Boolean))].join(", ");
  const genre = stories.flatMap((story) => story.subgenres)
    .find((value) => value.trim().toLocaleLowerCase("es") !== "dark romance") ?? saga.sagaType;
  const description = saga.intro || saga.description;

  return (
    <Link className={`saga-card${showArt ? "" : " saga-card-no-art"}`} href={`/sagas/${saga.slug}`}>
      {showArt ? <div className="saga-card-art" aria-hidden="true">
        {saga.coverUrl ? <EditorialImage className="saga-card-feature-cover" src={saga.coverUrl} alt="" width={200} height={300}
          sizes="(max-width: 600px) 150px, 200px" loading="lazy" /> : covers.length > 0 ? (
          <div className={`saga-card-covers saga-card-covers-${covers.length}`}>
            {covers.map((story) => <EditorialImage src={story.coverUrl!} alt="" width={142} height={205}
              sizes="(max-width: 600px) 126px, 142px" loading="lazy" key={story.id} />)}
          </div>
        ) : <span className="saga-card-monogram">{saga.name.slice(0, 1)}</span>}
        <span className="saga-card-count">
          <img src="/icons/book-open.svg" alt="" width="18" height="18" />
          {count} {count === 1 ? "libro" : "libros"}
        </span>
      </div> : null}
      <div className="saga-card-body">
        <Heading>{saga.name}</Heading>
        {byline ? <p className="saga-card-author">{byline}</p> : null}
        {showGenre && genre ? <p className="saga-card-genre">{genre}</p> : null}
        {description ? <p className="saga-card-description">{description}</p> : null}
        {saga.standalone === "Sí" || saga.bookRelationship ? (
          <div className="saga-card-tags">
            {saga.standalone === "Sí" ? <span><img src="/icons/book-open.svg" alt="" width="15" height="15" />Autoconclusivos</span> : null}
            {saga.bookRelationship ? <span><span aria-hidden="true">↗</span>{saga.bookRelationship}</span> : null}
          </div>
        ) : null}
        {showLink ? <span className="saga-card-link">Ver la saga <span aria-hidden="true">→</span></span> : null}
      </div>
    </Link>
  );
}

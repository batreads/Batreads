import Link from "next/link";
import type { Story } from "@/lib/notion";
import { EditorialImage } from "./editorial-image";

export function StoryGrid({
  stories,
  authorNames = {},
  headingLevel = 2,
  showActions = false,
}: {
  stories: Story[];
  authorNames?: Record<string, string>;
  headingLevel?: 2 | 3;
  showActions?: boolean;
}) {
  if (stories.length === 0) return <p>Todavía no hay historias publicadas.</p>;
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <div className="story-grid">
      {stories.map((story) => {
        const isHiddenGem = story.filterValues["Popularidad"]?.some((value) => value.trim().toLocaleLowerCase("es") === "hidden gem");
        const author = (story.authorId && authorNames[story.authorId]) || story.authorName;
        const description = story.synopsis || story.hook;
        const subgenre = story.subgenres.find((value) => value.trim().toLocaleLowerCase("es") !== "dark romance") ?? story.subgenres[0];
        const trope = story.tropes[0];

        const content = (
          <>
            <div className="story-card-cover">
              {story.coverUrl ? <EditorialImage src={story.coverUrl} alt="" width={116} height={177}
                sizes="(max-width: 600px) 86px, 116px" loading="lazy" /> : null}
            </div>
            <div className="story-card-body">
              {isHiddenGem ? (
                <div className="story-card-status">
                  <img src="/icons/gem.svg" alt="" width="14" height="14" />
                  <span>Hidden Gem</span>
                </div>
              ) : null}
              <div className="story-card-copy">
                <Heading>{story.title}</Heading>
                {author ? <p className="story-card-author">{author}</p> : null}
                {description ? <p className="story-card-description">{description}</p> : null}
              </div>
              {subgenre || trope ? (
                <div className="story-card-meta">
                  <div className="story-card-taxonomy">
                    {subgenre ? (
                      <span className="story-card-tag" aria-label={`Subgénero: ${subgenre}`}>
                        <img src="/icons/tag.svg" alt="" width="12" height="12" />
                        {subgenre}
                      </span>
                    ) : null}
                    {trope ? (
                      <span className="story-card-tag" aria-label={`Trope: ${trope}`}>
                        <img src="/icons/tag.svg" alt="" width="12" height="12" />
                        {trope}
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {showActions ? <nav className="books-like-hero-actions story-card-actions" aria-label={`Explorar ${story.title}`}>
                <Link href={`/historias/${story.slug}`}>Ver ficha del libro</Link>
                {story.amazonUrl ? <a className="books-like-amazon" href={story.amazonUrl}
                  target="_blank" rel="sponsored noopener noreferrer">Ver en Amazon <span aria-hidden="true">↗</span></a> : null}
              </nav> : null}
            </div>
          </>
        );
        const className = isHiddenGem ? "story-card story-card-hidden-gem" : "story-card";
        return showActions
          ? <article className={className} key={story.id}>{content}</article>
          : <Link className={className} href={`/historias/${story.slug}`} key={story.id}>{content}</Link>;
      })}
    </div>
  );
}

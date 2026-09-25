import Link from "next/link";
import type { Story } from "@/lib/notion";

export function StoryGrid({
  stories,
  authorNames = {},
}: {
  stories: Story[];
  authorNames?: Record<string, string>;
}) {
  if (stories.length === 0) return <p>Todavía no hay historias publicadas.</p>;

  return (
    <div className="story-grid">
      {stories.map((story) => {
        const popularity = story.filterValues["Popularidad"]?.[0];
        const author = (story.authorId && authorNames[story.authorId]) || story.authorName;
        const description = story.synopsis || story.hook;
        const trope = story.tropes[0];

        return (
          <Link className="story-card" href={`/historias/${story.slug}`} key={story.id}>
            <div className="story-card-cover">
              {story.coverUrl ? <img src={story.coverUrl} alt={`Portada de ${story.title}`} /> : null}
            </div>
            <div className="story-card-body">
              {popularity ? (
                <div className="story-card-status">
                  <img src="/icons/gem.svg" alt="" width="14" height="14" />
                  <span>{popularity}</span>
                </div>
              ) : null}
              <div className="story-card-copy">
                <h2>{story.title}</h2>
                {author ? <p className="story-card-author">{author}</p> : null}
                {description ? <p className="story-card-description">{description}</p> : null}
              </div>
              {(story.rating !== null || trope) ? (
                <div className="story-card-chips">
                  {story.rating !== null ? (
                    <span className="story-card-chip story-card-chip-score">
                      <img src="/icons/star.svg" alt="" width="14" height="14" />
                      Puntuación: {story.rating}/5
                    </span>
                  ) : null}
                  {trope ? (
                    <span className="story-card-chip story-card-chip-trope">
                      <img src="/icons/tag.svg" alt="" width="14" height="14" />
                      {trope}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

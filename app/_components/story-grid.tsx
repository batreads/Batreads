import Link from "next/link";
import type { Story } from "@/lib/notion";
import { StoryCardRating } from "./story-card-rating";

export function StoryGrid({
  stories,
  authorNames = {},
  headingLevel = 2,
}: {
  stories: Story[];
  authorNames?: Record<string, string>;
  headingLevel?: 2 | 3;
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

        return (
          <Link className={isHiddenGem ? "story-card story-card-hidden-gem" : "story-card"} href={`/historias/${story.slug}`} key={story.id}>
            <div className="story-card-cover">
              {story.coverUrl ? <img src={story.coverUrl} alt="" /> : null}
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
                {story.rating !== null ? <StoryCardRating rating={story.rating} /> : null}
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
            </div>
          </Link>
        );
      })}
    </div>
  );
}

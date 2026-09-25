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
      {stories.map((story) => (
        <Link className="story-card" href={`/historias/${story.slug}`} key={story.id}>
          {story.coverUrl ? <img src={story.coverUrl} alt={`Portada de ${story.title}`} /> : null}
          <div className="story-card-body">
            <h2>{story.title}</h2>
            {story.authorId && authorNames[story.authorId] ? <p>{authorNames[story.authorId]}</p> : null}
            {story.hook ? <p>{story.hook}</p> : null}
            <span>Ver ficha →</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

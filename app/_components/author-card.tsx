import Link from "next/link";
import type { Author } from "@/lib/notion";

export function AuthorCard({ author, storyCount, headingLevel = 2 }: {
  author: Pick<Author, "slug" | "name" | "intro">;
  storyCount: number;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <Link className="entity-card" href={`/autoras/${author.slug}`}>
      <Heading>{author.name}</Heading>
      {author.intro ? <p>{author.intro}</p> : null}
      <span>{storyCount} historias · Ver autora →</span>
    </Link>
  );
}

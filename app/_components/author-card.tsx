import Link from "next/link";
import { EditorialImage } from "./editorial-image";
import type { Author, Story } from "@/lib/notion";

export function AuthorCard({ author, recommendedStory, headingLevel = 2 }: {
  author: Pick<Author, "slug" | "name" | "intro" | "introCard" | "bio" | "specialties">;
  recommendedStory?: Pick<Story, "slug" | "title" | "coverUrl">;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const bio = author.bio.trim();
  const firstSentence = bio.match(/^[\s\S]+?[.!?](?=\s|$)/)?.[0];
  const secondSentence = firstSentence ? bio.slice(firstSentence.length).trim().match(/^[\s\S]+?[.!?](?=\s|$)/)?.[0] : null;
  const shortBio = firstSentence
    ? firstSentence.length < 80 && secondSentence ? `${firstSentence} ${secondSentence}` : firstSentence
    : bio;
  const description = author.introCard.trim() || author.intro.trim() || shortBio;

  return (
    <article className="story-card author-card">
      <div className="story-card-body">
        <div className="story-card-copy">
          <Heading><Link className="author-card-primary-link" href={`/autoras/${author.slug}`}>{author.name}</Link></Heading>
          {description ? <p className="story-card-description">{description}</p> : null}
        </div>
        {author.specialties.length > 0 ? (
          <div className="story-card-taxonomy" aria-label="Especialidades">
            {author.specialties.slice(0, 2).map((specialty) => (
              <span className="story-card-tag" key={specialty}>
                <img src="/icons/tag.svg" alt="" width="12" height="12" />
                {specialty}
              </span>
            ))}
          </div>
        ) : null}
        {recommendedStory ? (
          <div className="author-card-recommendation">
            <Link href={`/historias/${recommendedStory.slug}`}>
              {recommendedStory.coverUrl ? <span className="author-card-book-art" aria-hidden="true">
                <EditorialImage className="author-card-book-cover" src={recommendedStory.coverUrl} alt="" width={36} height={54} sizes="36px" />
              </span> : null}
              <span className="author-card-book-copy">
                <span>Una obra para empezar</span>
                <span>{recommendedStory.title} →</span>
              </span>
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}

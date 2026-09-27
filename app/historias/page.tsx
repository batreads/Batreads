import Link from "next/link";
import { StoryGrid } from "../_components/story-grid";
import { getAuthors, getStories } from "@/lib/notion";
import { getMood, matchesMood } from "@/lib/moods";

export default async function HistoriasPage({
  searchParams,
}: {
  searchParams: Promise<{ trope?: string | string[]; mood?: string | string[] }>;
}) {
  const [stories, authors] = await Promise.all([getStories(), getAuthors()]);
  const { trope: requestedTrope, mood: requestedMood } = await searchParams;
  const trope = typeof requestedTrope === "string" ? requestedTrope : undefined;
  const mood = getMood(typeof requestedMood === "string" ? requestedMood : undefined);
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
  const filteredStories = mood ? stories.filter((story) => matchesMood(story, mood))
    : trope && normalize(trope) !== "dark romance"
      ? stories.filter((story) => story.tropes.some((item) => normalize(item).includes(normalize(trope))))
      : stories;
  const hasTopicMatches = filteredStories.length > 0;
  const authorNames = Object.fromEntries(authors.map((author) => [author.id, author.name]));

  return (
    <main className="catalog-page">
      <Link className="back-link" href="/">← Batreads</Link>
      <header className="page-heading">
        <p className="eyebrow">Biblioteca editorial</p>
        <h1>{hasTopicMatches ? mood?.label ?? trope ?? "Historias" : "Historias"}</h1>
        <p>Descubre historias de dark romance con contexto, intensidad y criterio editorial.</p>
      </header>
      {(mood || trope) && !hasTopicMatches ? <p>Todavía no hay historias para esta selección en el catálogo. Puedes explorar las demás lecturas mientras tanto.</p> : null}
      <StoryGrid stories={hasTopicMatches ? filteredStories : stories} authorNames={authorNames} />
    </main>
  );
}

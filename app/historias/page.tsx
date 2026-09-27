import Link from "next/link";
import { StoryGrid } from "../_components/story-grid";
import { getAuthors, getStories } from "@/lib/notion";

export default async function HistoriasPage({
  searchParams,
}: {
  searchParams: Promise<{ trope?: string | string[] }>;
}) {
  const [stories, authors] = await Promise.all([getStories(), getAuthors()]);
  const requestedTrope = (await searchParams).trope;
  const trope = typeof requestedTrope === "string" ? requestedTrope : undefined;
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
  const filteredStories = trope && normalize(trope) !== "dark romance"
    ? stories.filter((story) => story.tropes.some((item) => normalize(item).includes(normalize(trope))))
    : stories;
  const hasTopicMatches = filteredStories.length > 0;
  const authorNames = Object.fromEntries(authors.map((author) => [author.id, author.name]));

  return (
    <main className="catalog-page">
      <Link className="back-link" href="/">← Batreads</Link>
      <header className="page-heading">
        <p className="eyebrow">Biblioteca editorial</p>
        <h1>{trope && hasTopicMatches ? trope : "Historias"}</h1>
        <p>Descubre historias de dark romance con contexto, intensidad y criterio editorial.</p>
      </header>
      {trope && !hasTopicMatches ? <p>Todavía no hay historias de {trope} en el catálogo. Puedes explorar las demás lecturas mientras tanto.</p> : null}
      <StoryGrid stories={hasTopicMatches ? filteredStories : stories} authorNames={authorNames} />
    </main>
  );
}

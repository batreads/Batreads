import type { Metadata } from "next";
import { Breadcrumbs } from "../_components/breadcrumbs";
import { FaqList } from "../_components/faq-list";
import { StoryGrid } from "../_components/story-grid";
import { getAuthors, getStories } from "@/lib/notion";

export const metadata: Metadata = {
  title: "Componentes compartidos | Batreads",
  robots: { index: false, follow: false },
};

export default async function ComponentsPage() {
  const [stories, authors] = await Promise.all([getStories(), getAuthors()]);
  const authorNames = Object.fromEntries(authors.map((author) => [author.id, author.name]));

  return (
    <main className="catalog-page components-reference-page">
      <Breadcrumbs items={[{ label: "Componentes" }]} />
      <header className="page-heading"><h1>Componentes compartidos</h1></header>
      <section className="story-section home-story-cards">
        <h2>Tarjeta de libro</h2>
        <StoryGrid stories={stories.slice(0, 1)} authorNames={authorNames} headingLevel={3} />
      </section>
      <section className="story-section">
        <h2>Preguntas frecuentes</h2>
        <FaqList items={[{ question: "¿Cómo elijo una historia?", answer: "Consulta la ficha, la puntuación y los avisos de contenido." }]} />
      </section>
    </main>
  );
}

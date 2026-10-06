import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { getAuthors, getStories } from "@/lib/notion";
import { catalogResults } from "@/lib/story-catalog";
import { StoriesCatalog } from "./stories-catalog";
import { Breadcrumbs } from "../_components/breadcrumbs";

export const metadata: Metadata = {
  title: "Libros de dark romance que hemos leído | Batreads",
  description: "Explora nuestras lecturas de dark romance en español. Cada ficha incluye reseña, sinopsis, tropes, nivel de spice y avisos de contenido.",
  alternates: { canonical: "/historias" },
};

type HistoriasPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HistoriasPage({ searchParams }: HistoriasPageProps) {
  await connection();
  const [stories, authors, currentSearchParams] = await Promise.all([getStories(), getAuthors(), searchParams]);
  const authorNames = Object.fromEntries(authors.map((author) => [author.id, author.name]));
  const query = new URLSearchParams();
  Object.entries(currentSearchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item));
    else if (value !== undefined) query.set(key, value);
  });
  const results = catalogResults(stories, query);

  return (
    <main className="catalog-page stories-catalog-page">
      <div className="stories-catalog-inner">
        <Breadcrumbs items={[{ label: "Libros" }]} />
        <Suspense fallback={<p>Preparando el catálogo…</p>}>
          <StoriesCatalog {...results} authorNames={authorNames} />
        </Suspense>
      </div>
    </main>
  );
}

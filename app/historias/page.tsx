import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { getAuthors, getStories } from "@/lib/notion";
import { StoriesCatalog } from "./stories-catalog";
import { Breadcrumbs } from "../_components/breadcrumbs";

export const metadata: Metadata = {
  title: "Libros de dark romance que hemos leído | Batreads",
  description: "Explora nuestras lecturas de dark romance en español. Cada ficha incluye reseña, sinopsis, tropes, nivel de spice y avisos de contenido.",
  alternates: { canonical: "/historias" },
};

export default async function HistoriasPage() {
  await connection();
  const [stories, authors] = await Promise.all([getStories(), getAuthors()]);
  const authorNames = Object.fromEntries(authors.map((author) => [author.id, author.name]));

  return (
    <main className="catalog-page stories-catalog-page">
      <div className="stories-catalog-inner">
        <Breadcrumbs items={[{ label: "Libros" }]} />
        <Suspense fallback={<p>Preparando el catálogo…</p>}>
          <StoriesCatalog stories={stories} authorNames={authorNames} />
        </Suspense>
      </div>
    </main>
  );
}

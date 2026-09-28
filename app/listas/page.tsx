import type { Metadata } from "next";
import Link from "next/link";
import { getSeoPages } from "@/lib/notion";

export const metadata: Metadata = {
  title: "Qué leer de dark romance: recomendaciones reales | Batreads",
  description: "Encuentra selecciones de dark romance basadas en libros que hemos leído. Te contamos qué ofrece cada historia para ayudarte a elegir tu próxima lectura.",
  alternates: { canonical: "/listas" },
};

export default async function ListasPage() {
  const pages = (await getSeoPages()).filter((page) => page.section === "listas");
  return (
    <main className="catalog-page">
      <Link className="back-link" href="/">← Batreads</Link>
      <header className="page-heading"><p className="eyebrow">Selecciones editoriales</p><h1>Listas</h1></header>
      {pages.length === 0 ? <p>Todavía no hay listas publicadas.</p> : (
        <div className="entity-grid">{pages.map((page) => (
          <Link className="entity-card" href={page.path} key={page.id}>
            <h2>{page.heading}</h2>
            {page.description ? <p>{page.description}</p> : null}
            <span>Explorar lista →</span>
          </Link>
        ))}</div>
      )}
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../_components/breadcrumbs";
import { getSeoPages } from "@/lib/notion";

export const metadata: Metadata = {
  title: "Qué leer de dark romance: recomendaciones reales | Batreads",
  description: "Encuentra selecciones de dark romance basadas en libros que hemos leído. Te contamos qué ofrece cada historia para ayudarte a elegir tu próxima lectura.",
  alternates: { canonical: "/listas" },
};

export default async function ListasPage() {
  const pages = (await getSeoPages()).filter((page) => page.section === "listas");
  return (
    <main className="catalog-page list-index-page">
      <Breadcrumbs items={[{ label: "Listas" }]} structuredDataPath="/listas" />
      <header className="page-heading">
        <p className="eyebrow">Selecciones editoriales</p>
        <h1>Listas <em>Batreads</em></h1>
        <p>Cuando quieres una recomendación más concreta.</p>
      </header>
      {pages.length === 0 ? <p>Todavía no hay listas publicadas.</p> : (
        <div className="home-lists-grid">{pages.map((page) => (
          <Link className="home-list-card" href={page.path} key={page.id}>
            <span className="home-list-card-label">Selección editorial</span>
            <h2>{page.heading}</h2>
            {page.description ? <p>{page.description}</p> : null}
            <span className="list-card-link">Explorar lista <span aria-hidden="true">→</span></span>
          </Link>
        ))}</div>
      )}
    </main>
  );
}

import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { getAuthors, getStories } from "@/lib/notion";
import { catalogResults, filterKeys } from "@/lib/story-catalog";
import { StoriesCatalog } from "./stories-catalog";
import { Breadcrumbs } from "../_components/breadcrumbs";

type HistoriasPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: HistoriasPageProps): Promise<Metadata> {
  const params = await searchParams;
  // Tracking parameters don't change the catalog and retain its clean canonical.
  const hasFiltersOrSort = [...filterKeys, "mood", "trope", "wattpad", "kindle-unlimited", "sort"]
    .some((key) => params[key] !== undefined);
  const requestedPage = params.page;
  const page = typeof requestedPage === "string" && /^[1-9]\d*$/.test(requestedPage)
    ? Number(requestedPage)
    : 1;

  return {
    title: "Libros de dark romance en español | Batreads",
    description: "Filtra libros de dark romance en español por oscuridad, spice, toxicidad y tropes. Compara las historias y consulta sus warnings antes de elegir.",
    ...(hasFiltersOrSort
      ? { robots: { index: false, follow: true } }
      : { alternates: { canonical: page > 1 ? `/historias?page=${page}` : "/historias" } }),
  };
}

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
  const requestedPage = currentSearchParams.page;
  if (requestedPage !== undefined) {
    if (typeof requestedPage !== "string" || !/^[1-9]\d*$/.test(requestedPage)
      || !Number.isSafeInteger(Number(requestedPage)) || Number(requestedPage) > results.pageCount) {
      notFound();
    }
    if (requestedPage === "1") {
      query.delete("page");
      const remainingQuery = query.toString();
      permanentRedirect(`/historias${remainingQuery ? `?${remainingQuery}` : ""}`);
    }
  }

  return (
    <main className="catalog-page stories-catalog-page">
      <div className="stories-catalog-inner">
        <Breadcrumbs items={[{ label: "Libros" }]} structuredDataPath="/historias" />
        <Suspense fallback={<p>Preparando el catálogo…</p>}>
          <StoriesCatalog {...results} authorNames={authorNames} />
        </Suspense>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs, createBreadcrumbList } from "../_components/breadcrumbs";
import { getSeoPages } from "@/lib/notion";
import { websiteOpenGraph } from "@/lib/seo-metadata";
import { siteUrl } from "@/lib/site-url";
import styles from "./catalog.module.css";

export const metadata: Metadata = {
  title: "Listas de dark romance y libros recomendados | Batreads",
  description: "Descubre nuestras recomendaciones de dark romance y encuentra tu próxima lectura. Listas de libros seleccionados para ayudarte a elegir qué leer.",
  alternates: { canonical: "/listas" },
  openGraph: {
    ...websiteOpenGraph("/listas"),
    images: [{
      url: "/opengraph-image",
      width: 1200,
      height: 630,
      alt: "Batreads: tu próxima obsesión empieza aquí. Dark romance y romantasy",
    }],
  },
};

const explorationLinks = [
  {
    href: "/historias",
    title: "Libros de dark romance",
    image: "/images/explore/libros.webp",
  },
  {
    href: "/autoras",
    title: "Autoras de dark romance",
    image: "/images/explore/autoras.webp",
  },
  {
    href: "/sagas",
    title: "Sagas y orden de lectura",
    image: "/images/explore/sagas.webp",
  },
];

const heading = "Listas de dark romance para encontrar tu próxima lectura";
const intro = "Descubre qué leer según el tipo de historia que buscas. Explora nuestras selecciones de dark romance y libros parecidos a tus favoritos, con recomendaciones que explican sus tropes, oscuridad, spice y avisos de contenido.";

export default async function ListasPage() {
  const pages = (await getSeoPages())
    .filter((page) => page.section === "listas")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)
      || a.path.localeCompare(b.path, "es")
      || a.id.localeCompare(b.id));
  const listsUrl = new URL("/listas", siteUrl).toString();
  const breadcrumb = createBreadcrumbList([{ label: "Listas" }], "/listas");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumb,
      {
        "@type": "CollectionPage",
        "@id": `${listsUrl}#webpage`,
        url: listsUrl,
        name: heading,
        description: intro,
        inLanguage: "es",
        breadcrumb: { "@id": breadcrumb["@id"] },
        mainEntity: {
          "@type": "ItemList",
          "@id": `${listsUrl}#lists`,
          numberOfItems: pages.length,
          itemListElement: pages.map((page, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: page.heading,
            url: new URL(page.path, siteUrl).toString(),
          })),
        },
      },
    ],
  };
  return (
    <main className={`catalog-page list-index-page ${styles.catalog}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }} />
      <Breadcrumbs items={[{ label: "Listas" }]} />
      <header className="page-heading">
        <p className="eyebrow">Selecciones editoriales</p>
        <h1>{heading}</h1>
        <p>{intro}</p>
      </header>
      {pages.length === 0 ? <p>Todavía no hay listas publicadas.</p> : (
        <div className="home-lists-grid">{pages.map((page) => {
          const summary = page.summary.trim() || page.description;
          return (
          <Link className="home-list-card author-discover-card" href={page.path} key={page.id}>
            <span className="home-list-card-label">Selección editorial</span>
            <h2>{page.heading}</h2>
            {summary ? <p>{summary}</p> : null}
            <span className="list-card-link">Explorar lista <span aria-hidden="true">→</span></span>
          </Link>
          );
        })}</div>
      )}
      <section className={styles.exploration} aria-labelledby="lists-exploration-title">
        <p className="eyebrow">Sigue explorando</p>
        <h2 id="lists-exploration-title">Más formas de encontrar tu próxima lectura</h2>
        <p className={styles.explorationIntro}>¿Prefieres explorar por libro, autora o saga? Continúa por el camino que más te interese.</p>
        <div className={styles.explorationGrid}>
          {explorationLinks.map((item) => (
              <Link className="home-mood-card" href={item.href} key={item.href}>
                <span className="home-mood-card-media">
                  <Image src={item.image} alt="" fill sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 820px) calc(50vw - 44px), 304px" />
                </span>
                <h3 className="home-mood-card-title">{item.title}</h3>
                <span className="home-mood-card-arrow" aria-hidden="true">
                  <Image src="/icons/mood-arrow.svg" alt="" width={20} height={20} />
                </span>
              </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

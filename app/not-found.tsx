import Image from "next/image";
import Link from "next/link";
import { getSeoPages } from "@/lib/notion";

export default async function NotFound() {
  const lists = (await getSeoPages())
    .filter((page) => page.section === "listas")
    .sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt))
    .slice(0, 3);

  return (
    <main className="not-found-page">
      <section className="not-found-hero" aria-labelledby="not-found-title">
        <div className="not-found-hero-inner">
          <div className="not-found-copy">
            <p className="home-hero-eyebrow">Página no encontrada · pero drama sí hay</p>
            <h1 id="not-found-title">Este capítulo no<br />estaba <em>en el libro.</em></h1>
            <p className="not-found-description">
              Puede que el enlace haya desaparecido, que la historia haya cambiado de título o que un murciélago se la haya llevado. Mientras lo investigamos, puedes volver a una parte de Batreads con menos misterio y más lecturas peligrosamente adictivas.
            </p>
            <div className="not-found-actions">
              <Link className="home-hero-action home-hero-action-primary" href="/">Volver al inicio <Image src="/icons/hero-arrow-primary.svg" alt="" width={20} height={20} /></Link>
              <Link className="home-hero-action home-hero-action-secondary" href="/historias">Explorar libros <Image src="/icons/hero-arrow-secondary.svg" alt="" width={20} height={20} /></Link>
            </div>
            <p className="not-found-quote">«No era un plot twist. Era simplemente un enlace roto.»</p>
          </div>
          <Image
            className="not-found-illustration"
            src="/images/not-found-illustration.webp"
            alt="Un murciélago dormido sobre un libro abierto con el número 404"
            width={1536}
            height={1024}
            priority
            sizes="(max-width: 1000px) 100vw, 50vw"
          />
        </div>
      </section>

      <section className="home-lists not-found-next" aria-labelledby="not-found-next-title">
        <div className="home-lists-inner">
          <div className="home-lists-heading">
            <div>
              <h2 id="not-found-next-title">Sigue leyendo en nuestras listas</h2>
              <p>Cuando quieres una recomendación más concreta.</p>
            </div>
            <Link className="home-section-more" href="/listas">Todas las listas <span aria-hidden="true">→</span></Link>
          </div>
          {lists.length > 0 ? (
            <div className="home-lists-grid">
              {lists.map((list) => (
                <Link className="home-list-card" href={list.path} key={list.id}>
                  <span className="home-list-card-label">Selección editorial</span>
                  <h3>{list.heading}</h3>
                  {list.description ? <p>{list.description}</p> : null}
                </Link>
              ))}
            </div>
          ) : <p className="not-found-no-lists">Todavía no hay listas publicadas.</p>}
        </div>
      </section>
    </main>
  );
}

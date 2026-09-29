import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
// import { KofiWidget } from "./kofi-widget"; // Recuperar junto con la tarjeta de café.
import { SupportSharing } from "./support-sharing";

export const metadata: Metadata = {
  title: "Apoya Batreads | Comparte o colabora",
  description: "Ayuda a que Batreads siga creciendo: comparte la web con otra lectora o propón una colaboración editorial.",
  alternates: { canonical: "/apoya" },
};

export default function ApoyaPage() {
  return (
    <main className="support-page">
      <div className="support-page-inner">
        <nav className="support-breadcrumbs" aria-label="Ruta de navegación">
          <Link href="/">Inicio</Link><span aria-hidden="true">›</span><span aria-current="page">Apoya Batreads</span>
        </nav>

        <header className="support-heading">
          <p className="eyebrow">Dos formas de apoyar</p>
          <h1>Apoya <em>Batreads</em></h1>
          <p>Una recomendación a una amiga o una colaboración editorial. Ambas ayudan a que Batreads pueda seguir sumando historias y guías.</p>
        </header>

        <section className="support-options" aria-label="Formas de apoyar Batreads">
          <div className="support-cards">
            <article className="support-card support-card-featured">
              <div className="support-card-image">
                <Image src="/icons/apoya-compartir.svg" width={96} height={96} alt="Bocadillo de conversación con un corazón" unoptimized />
              </div>
              <span className="support-card-tag">La forma más fácil</span>
              <div className="support-card-body">
                <h3>Compártelo</h3>
                <p>¿Conoces a alguien que siempre esté buscando su próximo dark romance? Compartir Batreads es una de las mejores formas de ayudar.</p>
                <SupportSharing />
              </div>
            </article>

            {/* Tarjeta de Ko-fi reservada para cuando el panel de aportaciones esté listo.
            <article className="support-card support-card-kofi">
              <div className="support-card-image">
                <Image src="/icons/apoya-cafe.svg" width={96} height={96} alt="Taza de café humeante" unoptimized />
              </div>
              <div className="support-card-body">
                <h3>Cómprame un café</h3>
                <p>Si Batreads te ha ayudado a encontrar tu próxima obsesión lectora, puedes apoyar el proyecto con un pequeño café.</p>
                <KofiWidget />
              </div>
            </article>
            */}

            <article className="support-card">
              <div className="support-card-image">
                <Image src="/icons/apoya-editoriales.svg" width={96} height={96} alt="Sobre para escribir a Batreads" unoptimized />
              </div>
              <div className="support-card-body">
                <h3>¿Eres una editorial?</h3>
                <p>Si tienes un libro que encaja con Batreads, quieres presentar una novedad o explorar una colaboración, podemos hablar.</p>
                <a className="support-card-action" href="mailto:hola.batreads@gmail.com?subject=Colaboraci%C3%B3n%20con%20Batreads">Escribe un email a: hola.batreads@gmail.com <span aria-hidden="true">↗</span></a>
              </div>
            </article>
          </div>

        </section>

        <aside className="support-thanks">
          <span className="support-thanks-heart" aria-hidden="true">♥</span>
          <div>
            <h2>Y si solo vienes a buscar libros, también está bien.</h2>
            <p>Leer las guías, descubrir historias y volver cuando buscas qué leer después ya hace que Batreads tenga sentido.</p>
          </div>
          <Link className="support-thanks-action" href="/historias">Explorar libros <span aria-hidden="true">→</span></Link>
        </aside>
      </div>
    </main>
  );
}

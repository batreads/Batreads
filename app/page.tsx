import Image from "next/image";
import Link from "next/link";
import { MoodExplorer } from "./_components/mood-explorer";

export default function Home() {
  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <Image className="home-hero-background" src="/images/home-hero.png" alt="" fill priority sizes="100vw" />
        <div className="home-hero-content">
          <p className="home-hero-eyebrow">Dark romance · Romantasy · Lecturas intensas</p>
          <h1 id="home-hero-title">Tu próxima<br /><em>obsesión</em> empieza aquí.</h1>
          <p className="home-hero-description">
            Dark romance, romantasy y lecturas que cuesta dejar.<br />{" "}
            Encuentra qué leer después.
          </p>
          <div className="home-hero-actions">
            <Link className="home-hero-action home-hero-action-primary" href="/historias">
              Explorar libros
              <Image src="/icons/hero-arrow-primary.svg" alt="" width={20} height={20} />
            </Link>
            <Link className="home-hero-action home-hero-action-secondary" href="/listas">
              Qué leer después
              <Image src="/icons/hero-arrow-secondary.svg" alt="" width={20} height={20} />
            </Link>
          </div>
        </div>
      </section>
      <MoodExplorer />
    </main>
  );
}

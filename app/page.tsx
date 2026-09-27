import Image from "next/image";
import Link from "next/link";

const topics = [
  { label: "Dark romance", href: "/historias?trope=Dark%20romance" },
  { label: "Reverse Harem", href: "/historias?trope=Reverse%20Harem" },
  { label: "Mafia", href: "/listas/mafia-romance-en-espanol" },
  { label: "Age Gap", href: "/historias?trope=Age%20Gap" },
  { label: "Taboo", href: "/historias?trope=Taboo" },
];

export default function Home() {
  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <Image className="home-hero-background" src="/images/home-hero.png" alt="" fill priority sizes="100vw" />
        <div className="home-hero-content">
          <p className="home-hero-eyebrow">Dark romance · Romantasy · Lecturas intensas</p>
          <h1 id="home-hero-title">Tu próxima<br /><em>obsesión</em> empieza aquí.</h1>
          <p className="home-hero-description">
            Dark romance, romantasy y lecturas que cuesta dejar.<br />
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
          <nav className="home-hero-topics" aria-label="Explorar libros por temática">
            <span>Explora por:</span>
            <ul>
              {topics.map((topic) => (
                <li key={topic.label}>
                  <Link href={topic.href}>
                    <Image src="/icons/tag.svg" alt="" width={24} height={24} />
                    {topic.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </main>
  );
}

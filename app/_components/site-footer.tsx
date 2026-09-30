import Image from "next/image";
import Link from "next/link";
import { CookiePreferencesButton } from "./cookie-preferences-button";

const exploreLinks = [
  { label: "Libros", href: "/historias" },
  { label: "Autoras", href: "/autoras" },
  { label: "Sagas", href: "/sagas" },
  { label: "Listas", href: "/listas" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <section className="site-footer-newsletter" aria-labelledby="footer-newsletter-title">
          <div className="site-footer-newsletter-copy">
            <p className="site-footer-newsletter-eyebrow">Newsletter Batreads</p>
            <h2 id="footer-newsletter-title">Tu dosis mensual de historias cuestionables.</h2>
            <p>Nuevos dark romance, hidden gems y recomendaciones seleccionadas en español.</p>
          </div>
          <div className="site-footer-newsletter-actions">
            <a
              className="site-footer-newsletter-cta"
              href="https://batreads.substack.com/subscribe"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Suscríbete a la newsletter de Batreads (abre en una pestaña nueva)"
            >
              Suscríbete a la newsletter <span aria-hidden="true">↗</span>
            </a>
            <p className="site-footer-newsletter-terms">
              La suscripción se completa en Substack. Consulta sus{" "}
              <a href="https://substack.com/tos">Términos de uso</a> y su{" "}
              <a href="https://substack.com/privacy">Política de privacidad</a>.
            </p>
          </div>
        </section>
        <div className="site-footer-top">
          <div className="site-footer-about">
            <Link className="site-footer-brand" href="/" aria-label="Batreads, ir al inicio">
              <Image src="/images/batreads-logo-illustrated.png" alt="" width={2172} height={724} sizes="(max-width: 600px) 180px, 210px" />
            </Link>
            <p>Historias intensas. Recomendaciones con criterio.</p>
          </div>
          <nav className="site-footer-nav" aria-label="Explorar Batreads">
            <h2>Explora</h2>
            {exploreLinks.map(({ label, href }) => <Link href={href} key={href}>{label}</Link>)}
            <Link href="/apoya">Apoya Batreads</Link>
          </nav>
          <nav className="site-footer-nav" aria-label="Información legal">
            <h2>Información</h2>
            <Link href="/condiciones-y-aviso-legal">Condiciones y aviso legal</Link>
            <Link href="/politica-de-cookies">Política de cookies</Link>
            <CookiePreferencesButton />
          </nav>
        </div>
        <div className="site-footer-bottom">
          <small>© {new Date().getFullYear()} Batreads</small>
          <span>Lee a tu ritmo. Elige con información.</span>
        </div>
      </div>
    </footer>
  );
}

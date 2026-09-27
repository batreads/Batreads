"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const sections = [
  { label: "Libros", href: "/historias" },
  { label: "Autoras", href: "/autoras" },
  { label: "Sagas", href: "/sagas" },
  { label: "Listas", href: "/listas" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="site-header-primary">
        <Link className="site-header-brand" href="/" aria-label="Batreads, ir al inicio">
          <Image src="/images/batreads-logo.png" alt="Batreads" width={435} height={99} priority />
        </Link>

        <nav className="site-header-nav" aria-label="Secciones principales">
          {sections.map(({ label, href }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link className={active ? "site-header-nav-link is-active" : "site-header-nav-link"} href={href} aria-current={active ? "page" : undefined} key={href}>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="site-header-support">
          <div className="site-header-support-copy">
            <span>Proyecto independiente</span>
            <small>Ayúdanos a seguir leyendo</small>
          </div>
          <button className="site-header-support-button" type="button" disabled title="Próximamente">
            Buy me a coffee
          </button>
        </div>

        <button
          className="site-header-menu-toggle"
          type="button"
          aria-controls="site-header-mobile-menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Cerrar" : "Menú"}
        </button>
      </div>

      <div className="site-header-rail">
        <Link className="site-header-rail-latest" href="/listas/ultima">
          <span className="site-header-status-dot" aria-hidden="true" />
          <span>Explora nuestras listas de lectura</span>
          <span className="site-header-arrow" aria-hidden="true">→</span>
        </Link>
      </div>

      {menuOpen ? (
        <div className="site-header-mobile-menu" id="site-header-mobile-menu">
          <nav className="site-header-mobile-nav" aria-label="Secciones principales para móvil">
            <p>Explorar Batreads</p>
            {sections.map(({ label, href }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link className={active ? "site-header-mobile-link is-active" : "site-header-mobile-link"} href={href} aria-current={active ? "page" : undefined} key={href} onClick={() => setMenuOpen(false)}>
                  <span><i aria-hidden="true" />{label}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              );
            })}
          </nav>
          <div className="site-header-mobile-support">
            <div className="site-header-support-copy">
              <span>Proyecto independiente</span>
              <small>Ayúdanos a seguir leyendo</small>
            </div>
            <button className="site-header-support-button" type="button" disabled title="Próximamente">
              Buy me a coffee
            </button>
          </div>
          <Link className="site-header-mobile-latest" href="/listas/ultima" onClick={() => setMenuOpen(false)}>
            <span className="site-header-status-dot" aria-hidden="true" />
            <span>Explora nuestras listas de lectura</span>
            <span className="site-header-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      ) : null}
    </header>
  );
}

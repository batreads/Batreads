import type { Metadata } from "next";
import { Breadcrumbs } from "../_components/breadcrumbs";

export const metadata: Metadata = {
  title: "Política de cookies · Batreads",
  description: "Información sobre las cookies y el almacenamiento de preferencias en Batreads.",
  alternates: { canonical: "/politica-de-cookies" },
};

export default function CookiePolicyPage() {
  return (
    <main className="legal-page">
      <div className="legal-page-inner">
        <Breadcrumbs items={[{ label: "Política de cookies" }]} />
        <header className="legal-heading">
          <p className="eyebrow">Información del sitio</p>
          <h1>Política de <em>cookies</em></h1>
          <p>Qué guarda Batreads en tu navegador y cómo puedes cambiar tu elección.</p>
        </header>

        <div className="legal-content">
          <section aria-labelledby="cookies-current">
            <h2 id="cookies-current">Uso actual</h2>
            <p>Batreads no instala actualmente cookies propias de analítica, publicidad ni personalización. La única cookie propia que establece esta web es una preferencia técnica cuando eliges «Aceptar» o «Rechazar» en el aviso.</p>
            <div className="cookie-policy-table-wrap">
              <table className="cookie-policy-table">
                <thead><tr><th scope="col">Nombre</th><th scope="col">Finalidad</th><th scope="col">Titular</th><th scope="col">Duración</th></tr></thead>
                <tbody><tr><td><code>batreads_cookie_preference</code></td><td>Recordar tu elección, la fecha y la versión del aviso para no preguntarte en cada visita.</td><td>Batreads</td><td>180 días</td></tr></tbody>
              </table>
            </div>
            <p>Esta cookie sirve únicamente para recordar la elección que has realizado. No se usa para medir tu actividad ni para mostrar publicidad.</p>
          </section>

          <section aria-labelledby="cookies-planned">
            <h2 id="cookies-planned">Google Analytics 4, previsto pero inactivo</h2>
            <p>Tenemos previsto usar Google Analytics 4 para conocer el uso general de la web. Todavía no hemos instalado su etiqueta, por lo que Batreads no coloca cookies de Google Analytics ni envía mediciones a este servicio. Tampoco usamos Google Ads.</p>
            <p>Antes de activarlo, publicaremos el detalle de las cookies y su duración reales, actualizaremos este aviso y te pediremos una nueva decisión. La elección guardada ahora no se utilizará como consentimiento para activar Google Analytics 4.</p>
          </section>

          <section aria-labelledby="cookies-control">
            <h2 id="cookies-control">Cómo cambiar tu elección</h2>
            <p>Puedes abrir de nuevo el aviso mediante «Cambiar preferencias de cookies», disponible en el pie de todas las páginas. También puedes borrar esta cookie desde la configuración de tu navegador; en ese caso, volveremos a mostrarte el aviso.</p>
          </section>

        </div>
      </div>
    </main>
  );
}

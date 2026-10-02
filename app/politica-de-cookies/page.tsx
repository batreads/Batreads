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
            <h2 id="cookies-current">Cookies que utilizamos</h2>
            <p>Batreads guarda tu elección sobre las cookies de analítica. Google Analytics 4 solo se carga cuando pulsas «Aceptar» en el aviso; si pulsas «Rechazar», no enviamos mediciones a Google Analytics. No utilizamos Google Ads.</p>
            <div className="cookie-policy-table-wrap">
              <table className="cookie-policy-table">
                <thead><tr><th scope="col">Nombre</th><th scope="col">Finalidad</th><th scope="col">Titular</th><th scope="col">Duración</th></tr></thead>
                <tbody>
                  <tr><td><code>batreads_cookie_preference</code></td><td>Recordar tu elección, la fecha y la versión del aviso para no preguntarte en cada visita.</td><td>Batreads</td><td>180 días</td></tr>
                  <tr><td><code>_ga</code></td><td>Distinguir visitantes para obtener estadísticas de uso. Solo se instala tras aceptar.</td><td>Google Analytics</td><td>Hasta 2 años</td></tr>
                  <tr><td><code>_ga_*</code></td><td>Mantener el estado de la sesión de Analytics. Solo se instala tras aceptar.</td><td>Google Analytics</td><td>Hasta 2 años</td></tr>
                </tbody>
              </table>
            </div>
            <p>La duración efectiva de las cookies de Analytics puede ser menor según el navegador. La cookie de preferencias no mide tu actividad.</p>
          </section>

          <section aria-labelledby="cookies-analytics">
            <h2 id="cookies-analytics">Medición con Google Analytics 4</h2>
            <p>Si aceptas, usamos Google Analytics 4 para conocer datos estadísticos sobre las visitas y las páginas consultadas. El identificador de medición de Batreads es <code>G-8JDPRM1WFL</code>. El servicio lo presta Google; puedes consultar su <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">política de privacidad</a>.</p>
            <p>Las decisiones guardadas antes de activar Analytics no se consideran consentimiento para esta medición. Por eso volvemos a mostrar el aviso tras el cambio.</p>
          </section>

          <section aria-labelledby="cookies-control">
            <h2 id="cookies-control">Cómo cambiar tu elección</h2>
            <p>Puedes abrir de nuevo el aviso mediante «Cambiar preferencias de cookies», disponible en el pie de todas las páginas. Si retiras tu consentimiento, dejamos de cargar Analytics en las siguientes visitas y eliminamos sus cookies accesibles desde esta web. También puedes borrar las cookies desde la configuración de tu navegador; en ese caso, volveremos a mostrarte el aviso.</p>
          </section>

        </div>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Condiciones y aviso legal · Batreads",
  description: "Información sobre Batreads, un proyecto personal sin actividad económica, y sus condiciones de uso.",
  alternates: { canonical: "/condiciones-y-aviso-legal" },
};

export default function LegalPage() {
  return (
    <main className="legal-page">
      <div className="legal-page-inner">
        <Link className="legal-back-link" href="/">← Volver al inicio</Link>
        <header className="legal-heading">
          <p className="eyebrow">Información del sitio</p>
          <h1>Condiciones y <em>aviso legal</em></h1>
          <p>Información sobre Batreads y las condiciones de uso de esta web.</p>
        </header>

        <div className="legal-content">
          <section aria-labelledby="legal-about">
            <h2 id="legal-about">1. Sobre Batreads</h2>
            <p>Batreads es un proyecto personal de recomendaciones de libros. En esta etapa no desarrolla una actividad económica: no vende productos ni servicios y no obtiene ingresos por publicidad, patrocinios o enlaces de afiliación.</p>
          </section>

          <section aria-labelledby="legal-purpose">
            <h2 id="legal-purpose">2. Objeto y uso de la web</h2>
            <p>Batreads permite descubrir historias de dark romance y consultar fichas, reseñas, valoraciones, listas y avisos de contenido. El acceso a la web es gratuito. Al utilizarla, te comprometes a hacerlo de forma lícita y a respetar los derechos de otras personas y del titular.</p>
          </section>

          <section aria-labelledby="legal-editorial">
            <h2 id="legal-editorial">3. Criterio editorial y avisos de contenido</h2>
            <p>Las reseñas, recomendaciones y puntuaciones expresan una valoración editorial subjetiva. Las etiquetas de intensidad y los avisos de contenido sirven de orientación y pueden no recoger todos los elementos sensibles de una obra. Revisa la información de cada libro y sus fuentes oficiales antes de decidir si quieres leerlo.</p>
          </section>

          <section aria-labelledby="legal-rights">
            <h2 id="legal-rights">4. Propiedad intelectual</h2>
            <p>Los textos, el diseño y los elementos originales de Batreads están protegidos por los derechos que correspondan a sus titulares. Las portadas, títulos y marcas de terceros pertenecen a sus respectivos propietarios y se muestran para identificar las obras comentadas. Puedes enlazar a las páginas de Batreads; para reproducir sus contenidos fuera de los usos permitidos por la ley, solicita autorización al titular.</p>
          </section>

          <section aria-labelledby="legal-links">
            <h2 id="legal-links">5. Enlaces a terceros</h2>
            <p>Algunas fichas incluyen enlaces a editoriales, tiendas o plataformas externas para facilitar la consulta de las obras. Batreads no recibe una comisión por esos enlaces ni vende directamente los libros. Los sitios externos tienen sus propias condiciones y prácticas, y Batreads no controla su contenido ni su disponibilidad.</p>
          </section>

          <section aria-labelledby="legal-changes">
            <h2 id="legal-changes">6. Cambios en la web</h2>
            <p>El contenido editorial y estas condiciones pueden actualizarse para reflejar cambios en Batreads. Si el proyecto incorpora publicidad, afiliación, patrocinios o cualquier otra actividad económica, se revisará esta página para incluir la información que corresponda.</p>
          </section>
        </div>
      </div>
    </main>
  );
}

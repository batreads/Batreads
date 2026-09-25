import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Batreads</h1>
      <p>Historias oscuras, recomendaciones con criterio.</p>
      <p>Estamos preparando la guía editorial de dark romance.</p>
      <nav aria-label="Secciones principales">
        <Link href="/historias">Historias</Link>
        <Link href="/autoras">Autoras</Link>
        <Link href="/sagas">Sagas</Link>
        <Link href="/listas">Listas</Link>
      </nav>
    </main>
  );
}

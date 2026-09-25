import { PlaceholderPage } from "../../_components/placeholder-page";

export default async function HistoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PlaceholderPage
      title={`Historia: ${slug.replaceAll("-", " ")}`}
      description="La ficha editorial de esta historia está en preparación."
      backHref="/historias"
      backLabel="Volver a historias"
    />
  );
}

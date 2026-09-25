import { PlaceholderPage } from "../../_components/placeholder-page";

export default async function AutoraPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PlaceholderPage
      title={`Autora: ${slug.replaceAll("-", " ")}`}
      description="El perfil de esta autora está en preparación."
      backHref="/autoras"
      backLabel="Volver a autoras"
    />
  );
}

import { PlaceholderPage } from "../../_components/placeholder-page";

export default async function ListaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PlaceholderPage
      title={`Lista: ${slug.replaceAll("-", " ")}`}
      description="Esta lista editorial está en preparación."
    />
  );
}

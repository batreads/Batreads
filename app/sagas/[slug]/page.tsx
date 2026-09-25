import { PlaceholderPage } from "../../_components/placeholder-page";

export default async function SagaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PlaceholderPage
      title={`Saga: ${slug.replaceAll("-", " ")}`}
      description="La ficha de esta saga está en preparación."
      backHref="/sagas"
      backLabel="Volver a sagas"
    />
  );
}

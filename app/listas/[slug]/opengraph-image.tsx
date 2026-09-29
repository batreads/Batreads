import { getSeoPageBySlug } from "@/lib/notion";
import { coversForSeoPage } from "@/lib/og-collection-data";
import { createCollectionOpenGraphImage, createOpenGraphImage, OG_SIZE } from "@/lib/og-image";

export const alt = "Selección de libros de Batreads";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 3600;
export const runtime = "nodejs";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const page = await getSeoPageBySlug((await params).slug);
    if (page?.section === "listas") {
      return await createCollectionOpenGraphImage({
        title: page.heading,
        kind: "list",
        coverUrls: await coversForSeoPage(page),
      });
    }
  } catch (error) {
    console.error("No se pudo generar la imagen Open Graph de la lista:", error);
  }
  return createOpenGraphImage();
}

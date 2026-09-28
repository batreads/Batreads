import { getStoryBySlug } from "@/lib/notion";
import { createOpenGraphImage, OG_SIZE } from "@/lib/og-image";

export const alt = "Descubre tu próxima lectura en Batreads";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 3600;
export const runtime = "nodejs";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const story = await getStoryBySlug(slug);
    if (story) {
      return createOpenGraphImage({
        variant: "story",
        title: story.title,
        author: story.authorName,
        coverUrl: story.coverUrl,
      });
    }
  } catch (error) {
    console.error("No se pudo generar la imagen Open Graph de la historia:", error);
  }

  return createOpenGraphImage();
}

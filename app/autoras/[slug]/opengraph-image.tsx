import { getAuthorBySlug, getStories } from "@/lib/notion";
import { createCollectionOpenGraphImage, createOpenGraphImage, OG_SIZE } from "@/lib/og-image";

export const alt = "Libros de una autora en Batreads";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 3600;
export const runtime = "nodejs";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const slug = (await params).slug;
    const [author, stories] = await Promise.all([getAuthorBySlug(slug), getStories()]);
    if (author) {
      const storyIds = new Set(author.storyIds);
      return await createCollectionOpenGraphImage({
        title: `Libros de ${author.name}`,
        kind: "author",
        coverUrls: stories
          .filter((story) => storyIds.has(story.id) || story.authorId === author.id)
          .map((story) => story.coverUrl)
          .filter((cover): cover is string => Boolean(cover))
          .slice(0, 3),
      });
    }
  } catch (error) {
    console.error("No se pudo generar la imagen Open Graph de la autora:", error);
  }
  return createOpenGraphImage();
}

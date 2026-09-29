import { getSeoPageByPath } from "@/lib/notion";
import { coversForSeoPage } from "@/lib/og-collection-data";
import { createCollectionOpenGraphImage, createOpenGraphImage } from "@/lib/og-image";

export const revalidate = 3600;
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  try {
    const path = `/${(await params).slug.join("/")}`;
    const page = await getSeoPageByPath(path);
    if (!page) return new Response(null, { status: 404 });

    return await createCollectionOpenGraphImage({
      title: page.heading,
      kind: page.section === "listas" ? "list" : "guide",
      coverUrls: await coversForSeoPage(page),
    });
  } catch (error) {
    console.error("No se pudo generar la imagen Open Graph de la guía:", error);
    return createOpenGraphImage();
  }
}

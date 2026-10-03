import { notFound, permanentRedirect } from "next/navigation";
import { getSeoPageByPath, getSeoPages } from "@/lib/notion";

type PageProps = { params: Promise<{ slug: string[] }> };

export async function generateStaticParams() {
  return (await getSeoPages())
    .map((page) => page.legacyPath)
    .filter((path): path is string => path !== null)
    .map((path) => ({ slug: path.slice(1).split("/") }));
}

export default async function SeoPageRoute({ params }: PageProps) {
  const page = await getSeoPageByPath(`/${(await params).slug.join("/")}`);
  if (!page?.legacyPath) notFound();
  permanentRedirect(page.path);
}

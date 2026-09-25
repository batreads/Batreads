import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoContent } from "../_components/seo-content";
import { getAuthors, getSagas, getSeoPageByPath, getSeoPages, getStories } from "@/lib/notion";

type PageProps = { params: Promise<{ slug: string[] }> };

export async function generateStaticParams() {
  return (await getSeoPages())
    .filter((page) => !page.path.startsWith("/listas/"))
    .map((page) => ({ slug: page.path.slice(1).split("/") }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await getSeoPageByPath(`/${(await params).slug.join("/")}`);
  return page
    ? { title: `${page.title} · Batreads`, description: page.description, alternates: { canonical: page.path }, robots: { index: false, follow: true } }
    : { title: "Página no encontrada · Batreads" };
}

export default async function SeoPageRoute({ params }: PageProps) {
  const page = await getSeoPageByPath(`/${(await params).slug.join("/")}`);
  if (!page) notFound();
  const [stories, authors, sagas] = await Promise.all([getStories(), getAuthors(), getSagas()]);
  return <SeoContent page={page} stories={stories} authors={authors} sagas={sagas} />;
}

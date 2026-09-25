import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { SeoContent } from "../../_components/seo-content";
import { getAuthors, getSagas, getSeoPageBySlug, getSeoPages, getStories } from "@/lib/notion";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getSeoPages()).filter((page) => page.section === "listas").map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await getSeoPageBySlug((await params).slug);
  return page && page.section === "listas"
    ? { title: `${page.title} · Batreads`, description: page.description, alternates: { canonical: page.path }, robots: { index: false, follow: true } }
    : { title: "Lista no encontrada · Batreads" };
}

export default async function ListaPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const page = await getSeoPageBySlug(slug);
  if (!page || page.section !== "listas") notFound();
  if (page.path !== `/listas/${slug}`) redirect(page.path);
  const [stories, authors, sagas] = await Promise.all([getStories(), getAuthors(), getSagas()]);

  return <SeoContent page={page} stories={stories} authors={authors} sagas={sagas} />;
}

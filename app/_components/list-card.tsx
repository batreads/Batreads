import type { ReactNode } from "react";
import Link from "next/link";
import { storiesForSeoPage, type SeoPage, type Story } from "@/lib/notion";
import { EditorialImage } from "./editorial-image";
import styles from "./list-card.module.css";

export function ListCardGrid({ children }: { children: ReactNode }) {
  return <div className={styles.listsGrid}>{children}</div>;
}

export function ListCard({ page, stories, headingLevel = 3 }: {
  page: SeoPage;
  stories: Story[];
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const summary = page.summary.trim() || page.description;
  const booksLike = page.pageType === "BooksLikeLanding";
  const referenceStory = booksLike
    ? page.mainStoryIds.map((id) => stories.find((story) => story.id === id && story.coverUrl)).find(Boolean)
    : undefined;
  const covers = referenceStory
    ? [referenceStory]
    : storiesForSeoPage(page, stories).filter((story) => story.coverUrl).slice(0, 3);
  return (
    <Link className={`${styles.listCard}${booksLike ? ` ${styles.booksLike}` : ""}${covers.length === 0 ? ` ${styles.withoutCovers}` : ""}`}
      href={page.path} aria-labelledby={`list-title-${page.id}`}>
      <div className={styles.cardMedia}>
        <span className={styles.cardLabel}>{booksLike ? "Libros parecidos" : "Lista temática"}</span>
      {covers.length > 0 ? <div className={`${styles.coverStack}${referenceStory ? ` ${styles.referenceCover}` : ""}`}>
        {covers.map((story) => <EditorialImage key={story.id} src={story.coverUrl!}
          alt={`Portada de ${story.title}`} width={120} height={180}
          sizes="(max-width: 600px) 100px, 110px" className={styles.cover} />)}
      </div> : null}
      </div>
      <div className={styles.cardCopy}>
        <Heading className={styles.cardTitle} id={`list-title-${page.id}`}>{page.heading}</Heading>
        {summary ? <p>{summary}</p> : null}
        <span className={styles.cardLink}>{booksLike ? "Encontrar mi próxima lectura" : "Ver selección"} <span aria-hidden="true">→</span></span>
      </div>
    </Link>
  );
}

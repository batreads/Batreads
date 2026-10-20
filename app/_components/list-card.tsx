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
  const covers = storiesForSeoPage(page, stories).filter((story) => story.coverUrl).slice(0, 3);
  return (
    <Link className={`${styles.listCard}${covers.length === 0 ? ` ${styles.withoutCovers}` : ""}`}
      href={page.path} aria-labelledby={`list-title-${page.id}`}>
      {covers.length > 0 ? <div className={styles.coverStack}>
        {covers.map((story) => <EditorialImage key={story.id} src={story.coverUrl!}
          alt={`Portada de ${story.title}`} width={120} height={180}
          sizes="(max-width: 600px) 100px, 110px" className={styles.cover} />)}
      </div> : null}
      <div className={styles.cardCopy}>
        <Heading className={styles.cardTitle} id={`list-title-${page.id}`}>{page.heading}</Heading>
        {summary ? <p>{summary}</p> : null}
        <span className={styles.cardLink}>Ver selección <span aria-hidden="true">→</span></span>
      </div>
    </Link>
  );
}

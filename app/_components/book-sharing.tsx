"use client";

import { useState } from "react";
import { copyToClipboard, generateBookShareText, getShareUrl, type ShareBook } from "@/lib/book-sharing";

type ShareEvent = "book_share_reddit" | "book_share_whatsapp" | "book_share_copy" | "book_share_copy_link";

function trackShare(event: ShareEvent, book: ShareBook) {
  const analyticsWindow = window as Window & { gtag?: (...args: unknown[]) => void };
  analyticsWindow.gtag?.("event", event, {
    book_id: book.id,
    book_slug: book.slug,
    book_title: book.title,
  });
}

export function BookSharing({ book }: { book: ShareBook }) {
  const [message, setMessage] = useState("");
  const [redditReady, setRedditReady] = useState(false);

  async function copy(value: string, successMessage: string, event: ShareEvent) {
    try {
      await copyToClipboard(value);
      setMessage(successMessage);
      trackShare(event, book);
      return true;
    } catch {
      setMessage("No se pudo copiar. Comprueba los permisos del portapapeles e inténtalo de nuevo.");
      return false;
    }
  }

  async function copyReddit() {
    setRedditReady(false);
    if (await copy(generateBookShareText(book, "reddit"), "Texto para Reddit copiado", "book_share_reddit")) {
      setRedditReady(true);
    }
  }

  function shareWhatsApp() {
    setRedditReady(false);
    setMessage("");
    trackShare("book_share_whatsapp", book);
  }

  function copyRecommendation() {
    setRedditReady(false);
    void copy(generateBookShareText(book, "copy"), "Recomendación copiada", "book_share_copy");
  }

  function copyLink() {
    setRedditReady(false);
    void copy(getShareUrl(book), "Enlace copiado", "book_share_copy_link");
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(generateBookShareText(book, "whatsapp"))}`;

  return (
    <section className="story-section book-sharing" aria-labelledby="book-sharing-title">
      <h2 id="book-sharing-title">Compartir este libro</h2>
      <div className="book-sharing-actions">
        <button type="button" onClick={copyReddit}>Reddit</button>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={shareWhatsApp}>WhatsApp</a>
        <button type="button" onClick={copyRecommendation}>Copiar recomendación</button>
        <button type="button" onClick={copyLink}>Copiar enlace</button>
      </div>
      <p className="book-sharing-feedback" role="status" aria-live="polite">
        {message}
        {redditReady ? <> · <a href="https://www.reddit.com/" target="_blank" rel="noopener noreferrer">Abrir Reddit ↗</a></> : null}
      </p>
    </section>
  );
}

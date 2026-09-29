"use client";

import { useState } from "react";

export function SupportSharing() {
  const [message, setMessage] = useState("");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setMessage("Enlace copiado");
    } catch {
      setMessage("No se pudo copiar el enlace. Puedes copiarlo desde la barra del navegador.");
    }
  }

  async function shareSite() {
    const data = {
      title: "Batreads",
      text: "Mira Batreads, una guía para descubrir dark romance y romantasy.",
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    await copyLink();
  }

  return (
    <div className="support-card-share">
      <button className="support-card-action" type="button" onClick={shareSite}>Compartir Batreads <span aria-hidden="true">↗</span></button>
      <button className="support-copy-link" type="button" onClick={copyLink}>Copiar enlace</button>
      <span className="support-share-message" role="status" aria-live="polite">{message}</span>
    </div>
  );
}

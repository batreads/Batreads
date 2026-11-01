"use client";

import { Analytics } from "@vercel/analytics/next";

export function VercelAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => {
        try {
          if (localStorage.getItem("batreads_excluir_visitas") === "1") {
            return null;
          }
        } catch {
          // Storage may be unavailable under the browser's privacy settings.
        }

        const url = new URL(event.url);
        url.search = "";
        url.hash = "";
        return { ...event, url: url.toString() };
      }}
    />
  );
}

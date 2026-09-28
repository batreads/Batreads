import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { SiteHeader } from "./_components/site-header";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "Dark romance en español: descubre tu próxima obsesión | Batreads",
  description: "Descubre tu próxima obsesión con recomendaciones reales de dark romance. Hemos leído los libros y te contamos qué esperar de cada historia antes de elegir.",
  openGraph: {
    siteName: "Batreads",
    type: "website",
    locale: "es_ES",
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body><Suspense fallback={null}><SiteHeader /></Suspense>{children}</body>
    </html>
  );
}

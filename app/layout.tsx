import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { SiteHeader } from "./_components/site-header";
import { SiteFooter } from "./_components/site-footer";
import { CookieNotice } from "./_components/cookie-notice";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

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
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body><Suspense fallback={null}><SiteHeader /></Suspense>{children}<SiteFooter /><CookieNotice /></body>
    </html>
  );
}

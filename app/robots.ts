import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://batreads.vercel.app").origin;

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", siteOrigin).toString(),
  };
}

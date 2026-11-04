import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  redirects() {
    // Preserve legacy list URLs independently of Notion's canonical Ruta field.
    return [
      "libros-parecidos-a-credence",
      "mafia-romance-en-espanol",
      "reverse-harem-en-espanol",
    ].map((slug) => ({
      source: `/${slug}`,
      destination: `/listas/${slug}`,
      permanent: true,
    }));
  },
};

export default nextConfig;

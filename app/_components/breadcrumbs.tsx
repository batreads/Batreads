import Link from "next/link";
import { siteUrl } from "@/lib/site-url";

type BreadcrumbItem = { label: string; href?: string };

export function createBreadcrumbList(items: BreadcrumbItem[], currentPath: string) {
  const currentUrl = new URL(currentPath, siteUrl).toString();
  const trail: BreadcrumbItem[] = [{ label: "Inicio", href: "/" }, ...items];

  return {
    "@type": "BreadcrumbList",
    "@id": `${currentUrl}#breadcrumb`,
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: new URL(item.href ?? currentPath, siteUrl).toString(),
    })),
  };
}

export function Breadcrumbs({ items, structuredDataPath }: {
  items: BreadcrumbItem[];
  structuredDataPath?: string;
}) {
  const trail: BreadcrumbItem[] = [{ label: "Inicio", href: "/" }, ...items];
  const jsonLd = structuredDataPath ? {
    "@context": "https://schema.org",
    ...createBreadcrumbList(items, structuredDataPath),
  } : null;

  return (
    <>
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }} /> : null}
      <nav className="breadcrumbs" aria-label="Ruta de navegación">
        <ol>
          {trail.map((item, index) => (
            <li key={item.href ?? `${item.label}-${index}`}>
              {item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

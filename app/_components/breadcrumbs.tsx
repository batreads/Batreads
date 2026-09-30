import Link from "next/link";

type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const trail: BreadcrumbItem[] = [{ label: "Inicio", href: "/" }, ...items];

  return (
    <nav className="breadcrumbs" aria-label="Ruta de navegación">
      <ol>
        {trail.map((item, index) => (
          <li key={item.href ?? `${item.label}-${index}`}>
            {item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

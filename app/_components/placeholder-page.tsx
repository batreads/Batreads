import Link from "next/link";

type PlaceholderPageProps = {
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
};

export function PlaceholderPage({
  title,
  description,
  backHref = "/",
  backLabel = "Volver al inicio",
}: PlaceholderPageProps) {
  return (
    <main>
      <Link href={backHref}>{backLabel}</Link>
      <h1>{title}</h1>
      <p>{description}</p>
    </main>
  );
}

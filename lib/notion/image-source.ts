export function imageSource(raw: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith("public/images/")) return `/${raw.slice("public/".length)}`;
  if (raw.startsWith("/images/")) return raw;
  return /^https:\/\//i.test(raw) ? raw : null;
}

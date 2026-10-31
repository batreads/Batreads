import { BookShelf, type ShelfBook } from "./book-shelf";

export function BookRecommendations({ groups }: {
  groups: { label: string; stories: ShelfBook[] }[];
}) {
  const books = new Map<string, ShelfBook>();
  for (const group of groups) {
    const reason = group.label === "En esta saga" ? "Misma saga"
      : group.label === "Parecidos a" ? "Parecido" : group.label;
    for (const book of group.stories) {
      const previous = books.get(book.id);
      books.set(book.id, { ...book, reasons: [...new Set([...(previous?.reasons ?? []), reason])] });
    }
  }
  return <BookShelf stories={[...books.values()]} label="Libros relacionados" />;
}

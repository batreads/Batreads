import type { ReactNode } from "react";

export type FaqItem = { question?: string; answer: ReactNode };

export function FaqList({ items, headingLevel = 3 }: { items: FaqItem[]; headingLevel?: 3 | 4 }) {
  const Heading = headingLevel === 4 ? "h4" : "h3";

  return (
    <div className="faq-list">
      {items.map(({ question, answer }, index) => (
        <div className="faq-list-item" key={`${question ?? "respuesta"}-${index}`}>
          {question ? <Heading>{question}</Heading> : null}
          <p>{answer}</p>
        </div>
      ))}
    </div>
  );
}

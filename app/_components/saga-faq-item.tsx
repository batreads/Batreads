"use client";

import { useId, useState } from "react";

export function SagaFaqItem({ question, answer }: { question: string; answer: string }) {
  const spoiler = /^\s*\[spoiler\]\s*/i.test(question);
  const title = question.replace(/^\s*\[spoiler\]\s*/i, "");
  const [revealed, setRevealed] = useState(false);
  const answerId = useId();
  const concealed = spoiler && !revealed;

  return (
    <div className="saga-faq-item">
      <h3>{title}</h3>
      <p id={answerId} className={concealed ? "saga-faq-answer-concealed" : undefined} aria-hidden={concealed || undefined} inert={concealed || undefined}>{answer}</p>
      {spoiler ? (
        <button className="saga-faq-spoiler-toggle" type="button" aria-expanded={revealed} aria-controls={answerId} onClick={() => setRevealed(!revealed)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>{revealed ? "Ocultar spoiler" : "Ver spoiler"}</span>
        </button>
      ) : null}
    </div>
  );
}

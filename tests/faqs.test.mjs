import assert from "node:assert/strict";
import { test } from "node:test";
import { parseFaqs, parseFaqAnswer } from "../lib/faqs.ts";

test("reads questions and multiline answers separated by blank lines", () => {
  assert.deepEqual(parseFaqs("¿Quién es?\r\nUna autora.\r\nEscribe romance.\r\n\r\n¿Por dónde empezar?\r\nPor el primero."), [
    { question: "¿Quién es?", answer: "Una autora.\nEscribe romance." },
    { question: "¿Por dónde empezar?", answer: "Por el primero." },
  ]);
});

test("keeps bullet lists between introductory and closing paragraphs", () => {
  const [faq] = parseFaqs("¿Por dónde empezar?<br />Según tus gustos.<br />• Universitario: God of Malice.<br />• Mafia: Trono de poder.<br />Consulta los avisos.");
  assert.deepEqual(parseFaqAnswer(faq.answer), [
    { type: "paragraph", text: "Según tus gustos." },
    { type: "bullets", items: ["Universitario: God of Malice.", "Mafia: Trono de poder."] },
    { type: "paragraph", text: "Consulta los avisos." },
  ]);
});

test("keeps numbered reading orders and their starting number", () => {
  const [faq] = parseFaqs("¿Qué libros siguen?\nLee en orden:\n2. God of Pain\n3. God of Wrath\n\nOtra pregunta\nRespuesta");
  assert.deepEqual(parseFaqAnswer(faq.answer), [
    { type: "paragraph", text: "Lee en orden:" },
    { type: "numbered", start: 2, items: ["God of Pain", "God of Wrath"] },
  ]);
});

test("supports Markdown bullets, numbered parentheses and indented continuations", () => {
  assert.deepEqual(parseFaqAnswer("- Primera\n  continuación\n* Segunda\n1) Uno\n2) Dos"), [
    { type: "bullets", items: ["Primera continuación", "Segunda"] },
    { type: "numbered", start: 1, items: ["Uno", "Dos"] },
  ]);
});

test("recognizes legacy inline bullets without treating HTML as markup", () => {
  assert.deepEqual(parseFaqAnswer("Elige: • Uno • <script>dos</script>"), [
    { type: "paragraph", text: "Elige:" },
    { type: "bullets", items: ["Uno", "<script>dos</script>"] },
  ]);
});

test("supports the HTML breaks used by existing saga FAQs", () => {
  assert.deepEqual(parseFaqs("Pregunta<br>Respuesta<br /><br />Otra pregunta<br/>Otra respuesta"), [
    { question: "Pregunta", answer: "Respuesta" },
    { question: "Otra pregunta", answer: "Otra respuesta" },
  ]);
});

test("omits empty content and questions without answers", () => {
  assert.deepEqual(parseFaqs(""), []);
  assert.deepEqual(parseFaqs("  \n\nPregunta sin respuesta\n\n"), []);
});

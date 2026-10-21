import assert from "node:assert/strict";
import { test } from "node:test";
import { parseFaqs } from "../lib/faqs.ts";

test("reads questions and multiline answers separated by blank lines", () => {
  assert.deepEqual(parseFaqs("¿Quién es?\r\nUna autora.\r\nEscribe romance.\r\n\r\n¿Por dónde empezar?\r\nPor el primero."), [
    { question: "¿Quién es?", answer: "Una autora. Escribe romance." },
    { question: "¿Por dónde empezar?", answer: "Por el primero." },
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

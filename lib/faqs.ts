export function parseFaqs(value: string): { question: string; answer: string }[] {
  return value.replace(/\r\n?/g, "\n")
    .split(/<br\s*\/?>(?:\s*<br\s*\/?>)+|\n\s*\n/i)
    .map((entry) => entry.replace(/<br\s*\/?>/gi, "\n").trim())
    .map((entry) => {
      const [question, ...answer] = entry.split("\n");
      return { question: question?.trim() ?? "", answer: answer.join("\n").trim() };
    })
    .filter(({ question, answer }) => Boolean(question && answer));
}

type FaqAnswerBlock =
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "numbered"; items: string[]; start: number };

/** Read plain-text lists without interpreting arbitrary HTML from the CMS. */
export function parseFaqAnswer(answer: string): FaqAnswerBlock[] {
  const blocks: FaqAnswerBlock[] = [];
  const lines = answer.replace(/\r\n?/g, "\n").replace(/<br\s*\/?>/gi, "\n")
    .replace(/\s+•\s+/g, "\n• ").split("\n");
  for (const line of lines) {
    const text = line.trim();
    if (!text) continue;
    const bullet = text.match(/^[•*-]\s+(.+)$/);
    const numbered = text.match(/^(\d+)[.)]\s+(.+)$/);
    const previous = blocks.at(-1);
    if (bullet) {
      if (previous?.type === "bullets") previous.items.push(bullet[1]);
      else blocks.push({ type: "bullets", items: [bullet[1]] });
    } else if (numbered) {
      const number = Number(numbered[1]);
      if (previous?.type === "numbered" && number === previous.start + previous.items.length) previous.items.push(numbered[2]);
      else blocks.push({ type: "numbered", start: number, items: [numbered[2]] });
    } else if (/^\s{2,}\S/.test(line) && previous && previous.type !== "paragraph") {
      previous.items[previous.items.length - 1] += ` ${text}`;
    } else if (previous?.type === "paragraph") {
      previous.text += ` ${text}`;
    } else {
      blocks.push({ type: "paragraph", text });
    }
  }
  return blocks;
}

export function parseFaqs(value: string): { question: string; answer: string }[] {
  return value.replace(/\r\n?/g, "\n")
    .split(/<br\s*\/?>(?:\s*<br\s*\/?>)+|\n\s*\n/i)
    .map((entry) => entry.replace(/<br\s*\/?>/gi, "\n").trim())
    .map((entry) => {
      const [question, ...answer] = entry.split("\n");
      return { question: question?.trim() ?? "", answer: answer.join(" ").trim() };
    })
    .filter(({ question, answer }) => Boolean(question && answer));
}

import { parseFaqAnswer } from "@/lib/faqs";

export function FaqAnswer({ answer }: { answer: string }) {
  return <>{parseFaqAnswer(answer).map((block, index) => {
    if (block.type === "paragraph") return <p key={index}>{block.text}</p>;
    const items = block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>);
    return block.type === "numbered"
      ? <ol key={index} start={block.start}>{items}</ol>
      : <ul key={index}>{items}</ul>;
  })}</>;
}

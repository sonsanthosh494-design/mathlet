"use client";

type Block = { type: string; text?: string; latex?: string; src?: string; alt?: string; items?: string[] };
export default function ContentBlocks({ blocks }: { blocks: unknown }) {
  if (!Array.isArray(blocks)) return null;
  return <div className="content-blocks">{(blocks as Block[]).map((block, index) => {
    if (block.type === "formula") return <div className="formula-block" key={index}>{block.latex}</div>;
    if (block.type === "diagram" && block.src) return <figure className="diagram-block" key={index}><img src={block.src} alt={block.alt ?? "Mathematics diagram"} /><figcaption>{block.alt}</figcaption></figure>;
    if (block.type === "steps") return <ol className="steps-block" key={index}>{(block.items ?? []).map((item, step) => <li key={step}>{item}</li>)}</ol>;
    return <p className={block.type === "given" ? "given-block" : ""} key={index}>{block.text}</p>;
  })}</div>;
}

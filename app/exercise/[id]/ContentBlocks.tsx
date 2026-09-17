"use client";

import { MathFormula, MathText } from "@/components/MathFormula";

export type RawBlock = {
  blockType?: string;
  type?: string;
  text?: string | null;
  latex?: string | null;
  assetUrl?: string | null;
  src?: string | null;
  assetAlt?: string | null;
  alt?: string | null;
  items?: string[];
  metadata?: { items?: string[] } | null;
};

export default function ContentBlocks({ blocks }: { blocks: unknown }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;

  return (
    <div className="content-blocks">
      {(blocks as RawBlock[]).map((block, index) => {
        const type = (block.blockType || block.type || "text").toLowerCase();
        const src = block.assetUrl || block.src;
        const alt = block.assetAlt || block.alt || "Mathematics diagram";
        const latex = block.latex;
        const text = block.text;

        const items: string[] = Array.isArray(block.items)
          ? block.items
          : Array.isArray(block.metadata?.items)
            ? block.metadata.items
            : text
              ? text.split("\n").map((s) => s.trim()).filter(Boolean)
              : [];

        if (type === "formula" && latex) {
          return (
            <div className="formula-block" key={index}>
              <MathFormula latex={latex} displayMode={true} />
            </div>
          );
        }

        if (type === "diagram") {
          return (
            <figure className="diagram-block" key={index}>
              {src ? (
                <img src={src} alt={alt} />
              ) : (
                <div className="diagram-placeholder" style={{ padding: "16px", background: "var(--paper)", border: "1px dashed var(--line)", borderRadius: "8px" }}>
                  <span style={{ fontSize: "24px", display: "block", marginBottom: "6px" }}>📐</span>
                  <strong style={{ fontSize: "14px", color: "var(--ink)" }}>{alt}</strong>
                </div>
              )}
              {src && alt && <figcaption>{alt}</figcaption>}
            </figure>
          );
        }

        if (type === "steps") {
          return (
            <ol className="steps-block" key={index}>
              {items.map((item, step) => (
                <li key={step}>
                  <MathText text={item} />
                </li>
              ))}
            </ol>
          );
        }

        if (type === "given") {
          return (
            <p className="given-block" key={index}>
              <strong>Given: </strong>
              <MathText text={text ?? ""} />
            </p>
          );
        }

        return (
          <p key={index}>
            <MathText text={text ?? ""} />
          </p>
        );
      })}
    </div>
  );
}

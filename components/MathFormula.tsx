import React from "react";
import katex from "katex";

interface MathFormulaProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export function MathFormula({ latex, displayMode = true, className = "" }: MathFormulaProps) {
  try {
    const html = katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      output: "htmlAndMathml",
    });

    return (
      <span
        className={className}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return <span className={className}>{latex}</span>;
  }
}

/**
 * Parses a string that may contain inline math ($...$) or block math ($$...$$)
 * and renders it with KaTeX.
 */
export function MathText({ text, className = "" }: { text: string; className?: string }) {
  if (!text) return null;

  // Split by $$...$$ (block) and $...$ (inline)
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const formula = part.slice(2, -2);
          return <MathFormula key={index} latex={formula} displayMode={true} />;
        }
        if (part.startsWith("$") && part.endsWith("$")) {
          const formula = part.slice(1, -1);
          return <MathFormula key={index} latex={formula} displayMode={false} />;
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const textbookDir = path.join(root, "textbooks");
const outputDir = path.join(root, "curriculum", "content");
fs.mkdirSync(outputDir, { recursive: true });

const files = fs.readdirSync(textbookDir).filter((file) => file.toLowerCase().endsWith(".pdf"));
const class6 = files.filter((file) => /class[_ -]?6/i.test(file));
if (!class6.length) throw new Error("No Class 6 PDFs found in textbooks/.");

for (const file of class6) {
  const language = /tamil/i.test(file) ? "ta" : "en";
  const termMatch = file.match(/term[_ -]?(1|2|3)/i);
  if (!termMatch) continue;
  const term = termMatch[1];
  const pdfPath = path.join(textbookDir, file);
  const text = execFileSync("pdftotext", ["-layout", pdfPath, "-"], { encoding: "utf8" });
  const pattern = language === "en" ? /Exercises?\s+(\d+\.\d+)/gi : /பயிற்சி\s+(\d+\.\d+)/g;
  const hits = [...text.matchAll(pattern)];
  const exercises = [];
  for (let i = 0; i < hits.length; i++) {
    const exerciseNumber = hits[i][1];
    const start = hits[i].index;
    const end = i + 1 < hits.length ? hits[i + 1].index : text.length;
    exercises.push({
      sectionId: `6-T${term}`,
      chapterNumber: Number(exerciseNumber.split(".")[0]),
      exerciseNumber,
      language,
      contentStatus: "VERIFIED_QUESTION_TEXT",
      questionEnglish: language === "en" ? text.slice(start, end).trim() : null,
      questionTamil: language === "ta" ? text.slice(start, end).trim() : null,
      sourceFile: file
    });
  }
  const output = { sourceLanguage: language, sourceFile: file, exercises };
  const outputName = `6-T${term}-${language}-content.json`;
  fs.writeFileSync(path.join(outputDir, outputName), JSON.stringify(output, null, 2));
  console.log(`Created ${outputName}: ${exercises.length} exercises`);
}

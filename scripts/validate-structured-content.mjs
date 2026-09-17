import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "curriculum", "structured");
const allowed = new Set(["FILL_BLANK","TRUE_FALSE","SHORT_ANSWER","COMPARISON","ORDERING","PLACE_VALUE","FORMAT_NUMBER","NUMBER_NAMES","NUMERALS","APPLICATION","FORMING_NUMBERS","MCQ","PROBLEM"]);
let files = 0, questions = 0, errors = 0;
for (const file of fs.readdirSync(root).filter(x => x.endsWith(".json") && !x.includes("map"))) {
  files++;
  const pack = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  if (!pack.sectionId || !pack.chapterNumber || !pack.exerciseNumber || !Array.isArray(pack.questions)) {
    console.error(`ERROR ${file}: invalid exercise structure`); errors++; continue;
  }
  const numbers = new Set();
  for (const q of pack.questions) {
    questions++;
    if (!q.questionNumber || numbers.has(q.questionNumber)) { console.error(`ERROR ${file}: duplicate/missing question number`); errors++; }
    numbers.add(q.questionNumber);
    if (!allowed.has(q.questionType)) { console.error(`ERROR ${file} Q${q.questionNumber}: invalid type ${q.questionType}`); errors++; }
    for (const lang of ["en","ta"]) {
      if (!q.translations?.[lang]?.trim()) { console.error(`ERROR ${file} Q${q.questionNumber}: missing ${lang} translation`); errors++; }
    }
    if (!Array.isArray(q.blocks)) { console.error(`ERROR ${file} Q${q.questionNumber}: blocks must be an array`); errors++; }
  }
}
if (errors) { console.error(`Validation failed: ${errors} error(s)`); process.exit(1); }
console.log(`Structured content valid: ${files} exercise file(s), ${questions} question record(s).`);

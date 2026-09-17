import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
const db = new PrismaClient();
const root = path.join(process.cwd(), "curriculum", "structured");
async function main() {
  for (const file of fs.readdirSync(root).filter(x => x.endsWith(".json"))) {
    const pack = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
    const exercise = await db.exercise.findFirst({ where: { sectionId: pack.sectionId, chapterNumber: pack.chapterNumber, exerciseNumber: pack.exerciseNumber, language: "en" } });
    if (!exercise) throw new Error(`Canonical English exercise not found: ${pack.exerciseNumber}`);
    for (const item of pack.questions) {
      const q = await db.question.upsert({ where: { exerciseId_questionNumber: { exerciseId: exercise.id, questionNumber: item.questionNumber } }, update: { questionType: item.questionType, orderIndex: Number(item.questionNumber), reviewStatus: "STRUCTURED" }, create: { exerciseId: exercise.id, questionNumber: item.questionNumber, questionType: item.questionType, orderIndex: Number(item.questionNumber), reviewStatus: "STRUCTURED" } });
      for (const language of ["en", "ta"]) {
        const prompt = item.translations[language];
        if (!prompt) continue;
        await db.questionTranslation.upsert({ where: { questionId_language: { questionId: q.id, language } }, update: { prompt }, create: { questionId: q.id, language, prompt } });
        await db.contentBlock.deleteMany({ where: { questionId: q.id, language } });
        const blocks = language === "en" ? item.blocks : [];
        if (blocks.length) await db.contentBlock.createMany({ data: blocks.map((b, index) => ({ questionId: q.id, language, orderIndex: index, blockType: b.blockType, text: b.text ?? null, latex: b.latex ?? null, assetUrl: b.assetUrl ?? null, assetAlt: b.assetAlt ?? null })) });
      }
    }
  }
  console.log("Structured pilot content imported.");
}
main().catch(console.error).finally(() => db.$disconnect());

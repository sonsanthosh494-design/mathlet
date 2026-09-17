import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';
import curriculum from '../curriculum/class-6-12-curriculum.json';

const db = new PrismaClient();

async function main() {
  for (const item of curriculum.classes) {
    await db.curriculumClass.upsert({ where: { classLevel: item.classLevel }, update: {}, create: { classLevel: item.classLevel } });
    for (const section of item.sections) {
      await db.curriculumSection.upsert({ where: { id: section.id }, update: { name: section.name, classLevel: item.classLevel }, create: { id: section.id, name: section.name, classLevel: item.classLevel } });
      for (const chapter of section.chapters) {
        await db.chapter.upsert({
          where: { sectionId_number: { sectionId: section.id, number: chapter.number } },
          update: { title: chapter.title, titleTamil: chapter.titleTamil },
          create: { sectionId: section.id, number: chapter.number, title: chapter.title, titleTamil: chapter.titleTamil }
        });
      }
    }
  }

  const exerciseDir = path.join(process.cwd(), 'curriculum', 'exercises');
  const exerciseFiles = fs.readdirSync(exerciseDir).filter((file) => file.endsWith('.json'));
  let exerciseCount = 0;
  for (const file of exerciseFiles) {
    const catalog = JSON.parse(fs.readFileSync(path.join(exerciseDir, file), 'utf8'));
    for (const exercise of catalog.exercises) {
      await db.exercise.upsert({
        where: { sectionId_chapterNumber_exerciseNumber_language: { sectionId: exercise.sectionId, chapterNumber: exercise.chapterNumber, exerciseNumber: exercise.exerciseNumber, language: exercise.language } },
        update: { status: exercise.status },
        create: {
          id: exercise.id,
          sectionId: exercise.sectionId,
          chapterNumber: exercise.chapterNumber,
          exerciseNumber: exercise.exerciseNumber,
          language: exercise.language,
          status: exercise.status
        }
      });
      exerciseCount++;
    }
  }
  const contentDir = path.join(process.cwd(), 'curriculum', 'content');
  if (fs.existsSync(contentDir)) {
    for (const file of fs.readdirSync(contentDir).filter((name) => name.endsWith('.json')).sort((a, b) => Number(a.includes('-content')) - Number(b.includes('-content')))) {
      const content = JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf8'));
      const items = Array.isArray(content.exercises) ? content.exercises : [content];
      for (const item of items) {
        await db.exercise.updateMany({
        where: { sectionId: item.sectionId, chapterNumber: item.chapterNumber, exerciseNumber: item.exerciseNumber, language: item.language },
        data: {
          questionEnglish: item.questionEnglish ?? null,
          questionTamil: item.questionTamil ?? null,
          solutionEnglish: item.solutionEnglish ?? null,
          solutionTamil: item.solutionTamil ?? null,
          contentStatus: item.contentStatus ?? 'PENDING_CONTENT',
            contentBlocks: item.contentBlocks ?? undefined,
            sourcePage: item.sourcePage ?? undefined
        }
        });
      }
    }
  }
  for (const file of fs.readdirSync(contentDir).filter((name) => name.endsWith('.json'))) {
    const content = JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf8'));
    const items = Array.isArray(content.exercises) ? content.exercises : [content];
    for (const item of items) {
      const exercise = await db.exercise.findFirst({ where: { sectionId: item.sectionId, chapterNumber: item.chapterNumber, exerciseNumber: item.exerciseNumber, language: item.language }, select: { id: true } });
      if (!exercise) continue;
      const question = await db.question.upsert({
        where: { exerciseId_questionNumber: { exerciseId: exercise.id, questionNumber: 'ALL' } },
        update: { reviewStatus: item.contentStatus === 'VERIFIED_QUESTION_TEXT' ? 'CLEANED' : 'RAW' },
        create: { exerciseId: exercise.id, questionNumber: 'ALL', questionType: 'TEXTBOOK_EXERCISE', reviewStatus: item.contentStatus === 'VERIFIED_QUESTION_TEXT' ? 'CLEANED' : 'RAW' }
      });
      const prompt = item.language === 'ta' ? item.questionTamil : item.questionEnglish;
      if (prompt) {
        await db.questionTranslation.upsert({
          where: { questionId_language: { questionId: question.id, language: item.language } },
          update: { prompt },
          create: { questionId: question.id, language: item.language, prompt }
        });
        const blocks = Array.isArray(item.contentBlocks) ? item.contentBlocks : [{ type: 'text', text: prompt }];
        for (let index = 0; index < blocks.length; index++) {
          const block = blocks[index];
          await db.contentBlock.upsert({
            where: { questionId_language_orderIndex: { questionId: question.id, language: item.language, orderIndex: index } },
            update: { blockType: block.type ?? 'text', text: block.text ?? null, latex: block.latex ?? null, assetUrl: block.src ?? null, assetAlt: block.alt ?? null },
            create: { questionId: question.id, language: item.language, orderIndex: index, blockType: block.type ?? 'text', text: block.text ?? null, latex: block.latex ?? null, assetUrl: block.src ?? null, assetAlt: block.alt ?? null }
          });
        }
      }
    }
  }

  console.log(`Seeded ${exerciseCount} exercise-language records and applied content files.`);
}

main().catch(console.error).finally(() => db.$disconnect());

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
    for (const file of fs.readdirSync(contentDir).filter((name) => name.endsWith('.json'))) {
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
          contentStatus: item.contentStatus ?? 'PENDING_CONTENT'
        }
        });
      }
    }
  }
  console.log(`Seeded ${exerciseCount} exercise-language records and applied content files.`);
}

main().catch(console.error).finally(() => db.$disconnect());

import { PrismaClient } from '@prisma/client';
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
}

main().catch(console.error).finally(() => db.$disconnect());

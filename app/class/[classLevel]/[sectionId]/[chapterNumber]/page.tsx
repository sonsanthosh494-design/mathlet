import Link from "next/link";
import curriculum from "../../../../../curriculum/class-6-12-curriculum.json";
import { db } from "../../../../../lib/prisma";
import ExerciseWorkspace from "./ExerciseWorkspace";

type Chapter = { number: number; title: string; titleTamil: string };
type Section = { id: string; name: string; chapters: Chapter[] };
type CurriculumClass = { classLevel: number; sections: Section[] };

export default async function ChapterPage({ params }: { params: Promise<{ classLevel: string; sectionId: string; chapterNumber: string }> }) {
  const { classLevel, sectionId, chapterNumber } = await params;
  const classItem = (curriculum.classes as CurriculumClass[]).find((item) => item.classLevel === Number(classLevel));
  const section = classItem?.sections.find((item) => item.id === sectionId);
  const chapter = section?.chapters.find((item) => item.number === Number(chapterNumber));
  if (!classItem || !section || !chapter) return <main className="shell not-found"><h1>Chapter not found</h1><Link href="/">Return to curriculum</Link></main>;

  let exercises: { id: string; exerciseNumber: string; language: string; status: string }[] = [];
  try {
    exercises = await db.exercise.findMany({ where: { sectionId, chapterNumber }, orderBy: { exerciseNumber: "asc" }, select: { id: true, exerciseNumber: true, language: true, status: true } });
  } catch { /* Keep the page usable while Neon is unavailable. */ }

  return <main className="shell">
    <nav className="nav"><Link className="brand" href="/"><span className="brand-mark">∑</span><span>mathlet</span></Link><span className="nav-note">Class {classItem.classLevel} · {section.name}</span></nav>
    <section className="chapter-hero"><Link className="back-link" href="/">← All classes</Link><div className="eyebrow">CLASS {classItem.classLevel} · {section.name.toUpperCase()}</div><h1>Chapter {chapter.number}<br /><span>{chapter.title}</span></h1><p>{chapter.titleTamil}</p></section>
    <ExerciseWorkspace exercises={exercises} />
    <footer><span>mathlet</span><span>Learn one idea at a time.</span></footer>
  </main>;
}

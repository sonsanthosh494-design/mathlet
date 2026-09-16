import Link from "next/link";
import curriculum from "../../../../../curriculum/class-6-12-curriculum.json";

type Chapter = { number: number; title: string; titleTamil: string };
type Section = { id: string; name: string; chapters: Chapter[] };
type CurriculumClass = { classLevel: number; sections: Section[] };

export default async function ChapterPage({ params }: { params: Promise<{ classLevel: string; sectionId: string; chapterNumber: string }> }) {
  const { classLevel, sectionId, chapterNumber } = await params;
  const classItem = (curriculum.classes as CurriculumClass[]).find((item) => item.classLevel === Number(classLevel));
  const section = classItem?.sections.find((item) => item.id === sectionId);
  const chapter = section?.chapters.find((item) => item.number === Number(chapterNumber));

  if (!classItem || !section || !chapter) return <main className="shell not-found"><h1>Chapter not found</h1><Link href="/">Return to curriculum</Link></main>;

  return <main className="shell">
    <nav className="nav"><Link className="brand" href="/"><span className="brand-mark">∑</span><span>mathlet</span></Link><span className="nav-note">Class {classItem.classLevel} · {section.name}</span></nav>
    <section className="chapter-hero"><Link className="back-link" href="/">← All classes</Link><div className="eyebrow">CLASS {classItem.classLevel} · {section.name.toUpperCase()}</div><h1>Chapter {chapter.number}<br /><span>{chapter.title}</span></h1><p>{chapter.titleTamil}</p></section>
    <section className="exercise-panel"><div className="eyebrow">PRACTICE AREA</div><h2>Exercises are being prepared</h2><p>Verified exercise numbers and questions from the Tamil Nadu textbook will appear here. You will be able to practise, track attempts, and review solutions.</p><div className="exercise-placeholder"><span>✦</span><strong>Exercise catalogue coming next</strong><small>This chapter is connected and ready for exercise data.</small></div></section>
    <footer><span>mathlet</span><span>Learn one idea at a time.</span></footer>
  </main>;
}

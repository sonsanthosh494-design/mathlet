import Link from "next/link";
import { db } from "../../../lib/prisma";
import PracticeAttempt from "./PracticeAttempt";
import ContentBlocks from "./ContentBlocks";

export default async function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exercise = await db.exercise.findUnique({ where: { id } });
  if (!exercise) return <main className="shell not-found"><h1>Exercise not found</h1><Link href="/">Return to curriculum</Link></main>;
  const language = exercise.language === "ta" ? "ta" : "en";
  const languageName = language === "ta" ? "தமிழ்" : "English";
  const canonical = language === "en" ? exercise : await db.exercise.findFirst({ where: { sectionId: exercise.sectionId, chapterNumber: exercise.chapterNumber, exerciseNumber: exercise.exerciseNumber, language: "en" } });
  const questions = canonical ? await db.question.findMany({ where: { exerciseId: canonical.id, NOT: { questionNumber: "ALL" } }, include: { translations: true, blocks: { where: { language }, orderBy: { orderIndex: "asc" } } }, orderBy: { orderIndex: "asc" } }) : [];
  return <main className="shell">
    <nav className="nav"><Link className="brand" href="/"><span className="brand-mark">∑</span><span>mathlet</span></Link><span className="nav-note">{languageName} · Exercise {exercise.exerciseNumber}</span></nav>
    <section className="exercise-detail">
      <Link className="back-link" href={`/class/${exercise.sectionId.split("-")[0]}/${exercise.sectionId}/${exercise.chapterNumber}`}>← Back to chapter</Link>
      <div className="eyebrow">EXERCISE {exercise.exerciseNumber} · {languageName.toUpperCase()}</div><h1>Let&apos;s solve<br /><span>this together.</span></h1>
      {questions.length ? <div className="structured-question-list">{questions.map(q => { const translation = q.translations.find(t => t.language === language); return <article className="question-card" key={q.id}><div className="eyebrow">QUESTION {q.questionNumber}</div><p>{translation?.prompt || "Question content is being prepared."}</p>{q.blocks.length > 0 && <ContentBlocks blocks={q.blocks} />}</article>; })}</div> : exercise.contentBlocks ? <div className="question-card"><div className="eyebrow">QUESTION</div><ContentBlocks blocks={exercise.contentBlocks} /></div> : <div className="exercise-empty"><div className="empty-icon">?</div><strong>Question content is being prepared</strong><p>This exercise is verified, but its structured questions have not been imported yet.</p></div>}
      <PracticeAttempt exerciseId={exercise.id} />
    </section><footer><span>mathlet</span><span>Learn one idea at a time.</span></footer>
  </main>;
}

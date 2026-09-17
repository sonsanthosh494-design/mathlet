import Link from "next/link";
import { db } from "../../../lib/prisma";
import PracticeAttempt from "./PracticeAttempt";
import ContentBlocks from "./ContentBlocks";

export default async function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exercise = await db.exercise.findUnique({ where: { id } });
  if (!exercise) return <main className="shell not-found"><h1>Exercise not found</h1><Link href="/">Return to curriculum</Link></main>;
  const languageName = exercise.language === "ta" ? "தமிழ்" : "English";
  const question = exercise.language === "ta" ? exercise.questionTamil : exercise.questionEnglish;
  const solution = exercise.language === "ta" ? exercise.solutionTamil : exercise.solutionEnglish;
  return <main className="shell">
    <nav className="nav"><Link className="brand" href="/"><span className="brand-mark">∑</span><span>mathlet</span></Link><span className="nav-note">{languageName} · Exercise {exercise.exerciseNumber}</span></nav>
    <section className="exercise-detail">
      <Link className="back-link" href={`/class/${exercise.sectionId.split("-")[0]}/${exercise.sectionId}/${exercise.chapterNumber}`}>← Back to chapter</Link>
      <div className="eyebrow">EXERCISE {exercise.exerciseNumber} · {languageName.toUpperCase()}</div><h1>Let&apos;s solve<br /><span>this together.</span></h1>
      {exercise.contentBlocks ? <div className="question-card"><div className="eyebrow">QUESTION</div><ContentBlocks blocks={exercise.contentBlocks} /></div> : question ? <div className="question-card"><div className="eyebrow">QUESTION</div><p>{question}</p></div> : <div className="exercise-empty"><div className="empty-icon">?</div><strong>Question content is being prepared</strong><p>This exercise number is verified. The textbook question and worked solution will be added after content review.</p></div>}
      {solution && <div className="solution-card"><div className="eyebrow">WORKED SOLUTION</div><p>{solution}</p></div>}
      <PracticeAttempt exerciseId={exercise.id} />
    </section><footer><span>mathlet</span><span>Learn one idea at a time.</span></footer>
  </main>;
}

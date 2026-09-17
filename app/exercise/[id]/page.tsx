import Link from "next/link";
import { db } from "@/lib/prisma";
import PracticeAttempt from "./PracticeAttempt";
import ContentBlocks from "./ContentBlocks";
import { Navbar } from "@/components/Navbar";
import { MathText } from "@/components/MathFormula";

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exercise = await db.exercise.findUnique({ where: { id } });

  if (!exercise) {
    return (
      <main className="shell not-found">
        <h1>Exercise not found</h1>
        <Link href="/">Return to curriculum</Link>
      </main>
    );
  }

  const language = exercise.language === "ta" ? "ta" : "en";
  const languageName = language === "ta" ? "தமிழ்" : "English";

  const canonical =
    language === "en"
      ? exercise
      : await db.exercise.findFirst({
          where: {
            sectionId: exercise.sectionId,
            chapterNumber: exercise.chapterNumber,
            exerciseNumber: exercise.exerciseNumber,
            language: "en",
          },
        });

  const counterpart = await db.exercise.findFirst({
    where: {
      sectionId: exercise.sectionId,
      chapterNumber: exercise.chapterNumber,
      exerciseNumber: exercise.exerciseNumber,
      language: language === "en" ? "ta" : "en",
    },
    select: { id: true },
  });

  const questions = canonical
    ? await db.question.findMany({
        where: { exerciseId: canonical.id, NOT: { questionNumber: "ALL" } },
        include: {
          translations: true,
          blocks: {
            where: { language },
            orderBy: { orderIndex: "asc" },
          },
        },
        orderBy: { orderIndex: "asc" },
      })
    : [];

  const classLevel = exercise.sectionId.split("-")[0];

  return (
    <main className="shell">
      <Navbar subtitle={`${languageName} · Exercise ${exercise.exerciseNumber}`} />

      <section className="exercise-detail">
        <Link
          className="back-link"
          href={`/class/${classLevel}/${exercise.sectionId}/${exercise.chapterNumber}`}
        >
          ← Back to chapter
        </Link>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div className="eyebrow">
            EXERCISE {exercise.exerciseNumber} · {languageName.toUpperCase()}
          </div>
          {counterpart && (
            <Link
              href={`/exercise/${counterpart.id}`}
              style={{
                fontSize: "12px",
                fontFamily: "'DM Mono', monospace",
                textDecoration: "none",
                background: "var(--paper)",
                border: "1px solid var(--line)",
                padding: "6px 12px",
                borderRadius: "6px",
                color: "var(--ink)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>Switch to {language === "en" ? "தமிழ்" : "English"}</span>
              <span>⇄</span>
            </Link>
          )}
        </div>

        <h1>
          Let&apos;s solve
          <br />
          <span>this together.</span>
        </h1>

        {questions.length ? (
          <div className="structured-question-list">
            {questions.map((q) => {
              const translation = q.translations.find((t) => t.language === language);
              return (
                <article className="question-card" key={q.id}>
                  <div className="eyebrow">QUESTION {q.questionNumber}</div>
                  <p>
                    <MathText
                      text={
                        translation?.prompt ||
                        "Question content is being prepared."
                      }
                    />
                  </p>
                  {q.blocks.length > 0 && <ContentBlocks blocks={q.blocks} />}
                </article>
              );
            })}
          </div>
        ) : exercise.contentBlocks ? (
          <div className="question-card">
            <div className="eyebrow">QUESTION</div>
            <ContentBlocks blocks={exercise.contentBlocks} />
          </div>
        ) : (
          <div className="exercise-empty">
            <div className="empty-icon">?</div>
            <strong>Question content is being prepared</strong>
            <p>
              This exercise is verified, but its structured questions have not
              been imported yet.
            </p>
          </div>
        )}

        <PracticeAttempt exerciseId={exercise.id} />
      </section>

      <footer>
        <span>mathlet</span>
        <span>Learn one idea at a time.</span>
      </footer>
    </main>
  );
}

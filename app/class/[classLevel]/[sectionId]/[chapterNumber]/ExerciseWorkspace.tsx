"use client";

import { useState } from "react";

type Exercise = { id: string; exerciseNumber: string; language: string; status: string };
export default function ExerciseWorkspace({ exercises }: { exercises: Exercise[] }) {
  const [language, setLanguage] = useState<"all" | "en" | "ta">("all");
  const visible = exercises.filter((item) => language === "all" || item.language === language);
  return <section className="exercise-panel">
    <div className="practice-top"><div><div className="eyebrow">PRACTICE AREA</div><h2>Exercises for this chapter</h2></div><span className="status-pill">{exercises.length} labels loaded</span></div>
    <div className="exercise-tabs"><button className={language === "all" ? "active" : ""} onClick={() => setLanguage("all")}>All</button><button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>English</button><button className={language === "ta" ? "active" : ""} onClick={() => setLanguage("ta")}>தமிழ்</button></div>
    {visible.length ? <div className="exercise-grid">{visible.map((exercise) => <button className="exercise-card" key={exercise.id}><span className="exercise-number">{exercise.exerciseNumber}</span><span>{exercise.language === "ta" ? "தமிழ் பயிற்சி" : "English exercise"}</span><span className="row-arrow">→</span></button>)}</div> : <div className="exercise-empty"><div className="empty-icon">∑</div><strong>No exercise labels found for this chapter</strong><p>Check that the Neon database has been migrated and seeded.</p></div>}
  </section>;
}

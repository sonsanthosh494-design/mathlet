"use client";

import { useState } from "react";

export default function ExerciseWorkspace() {
  const [filter, setFilter] = useState<"all" | "practice">("all");
  return <section className="exercise-panel">
    <div className="practice-top"><div><div className="eyebrow">PRACTICE AREA</div><h2>Exercises for this chapter</h2></div><span className="status-pill">Preparing catalogue</span></div>
    <div className="exercise-tabs"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All exercises</button><button className={filter === "practice" ? "active" : ""} onClick={() => setFilter("practice")}>Practice sets</button></div>
    <div className="exercise-empty"><div className="empty-icon">{filter === "all" ? "∑" : "✦"}</div><strong>Verified exercise content is coming next</strong><p>The textbook exercise numbers and questions will be added after they are checked against the Tamil and English editions.</p><div className="empty-meta"><span>✓ Chapter connected</span><span>○ Questions pending import</span></div></div>
  </section>;
}

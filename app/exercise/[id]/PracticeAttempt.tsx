"use client";

import { useEffect, useState } from "react";

export default function PracticeAttempt({ exerciseId }: { exerciseId: string }) {
  const key = `mathlet:completed:${exerciseId}`;
  const [answer, setAnswer] = useState("");
  const [completed, setCompleted] = useState(false);

  useEffect(() => setCompleted(localStorage.getItem(key) === "true"), [key]);

  function markComplete() {
    localStorage.setItem(key, "true");
    setCompleted(true);
  }

  return <div className="attempt-card">
    <div className="eyebrow">YOUR ATTEMPT</div>
    <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Write your working or answer here..." rows={5} />
    <div className="attempt-actions"><button className={completed ? "complete-button done" : "complete-button"} onClick={markComplete}>{completed ? "✓ Completed" : "Mark as completed"}</button><span>{answer.length} characters</span></div>
  </div>;
}

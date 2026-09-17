"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Translation = { language: string; prompt: string; given: string | null; answer: string | null; solutionSummary: string | null };
type Block = { blockType: string; text?: string | null; latex?: string | null; assetUrl?: string | null; assetAlt?: string | null; metadata?: unknown };
type Q = { id: string; questionNumber: string; reviewStatus: string; exercise: { exerciseNumber: string; language: string; sectionId: string; chapterNumber: number }; translations: Translation[]; blocks: (Block & { language: string })[] };

export default function ContentAdmin() {
  const [questions, setQuestions] = useState<Q[]>([]);
  const [selected, setSelected] = useState<Q | null>(null);
  const [language, setLanguage] = useState("en");
  const [prompt, setPrompt] = useState("");
  const [given, setGiven] = useState("");
  const [answer, setAnswer] = useState("");
  const [solutionSummary, setSolutionSummary] = useState("");
  const [blocksJson, setBlocksJson] = useState("[]");
  const [status, setStatus] = useState("CLEANED");
  const [message, setMessage] = useState("");

  useEffect(() => { fetch("/api/admin/questions", { cache: "no-store" }).then(async r => { const d = await r.json(); if (r.ok) setQuestions(d.questions); else setMessage(d.error); }); }, []);

  function choose(q: Q, lang = language) {
    setSelected(q);
    const t = q.translations.find(x => x.language === lang) || q.translations[0];
    const blocks = q.blocks.filter(x => x.language === lang).map(({ language: _language, ...block }) => block);
    setPrompt(t?.prompt || ""); setGiven(t?.given || ""); setAnswer(t?.answer || ""); setSolutionSummary(t?.solutionSummary || "");
    setBlocksJson(JSON.stringify(blocks, null, 2)); setStatus(q.reviewStatus); setMessage("");
  }
  function switchLanguage(lang: string) { setLanguage(lang); if (selected) choose(selected, lang); }
  async function save() {
    if (!selected) return;
    const r = await fetch("/api/admin/questions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: selected.id, language, prompt, given, answer, solutionSummary, blocksJson, reviewStatus: status }) });
    const d = await r.json(); setMessage(r.ok ? "Saved successfully." : d.error);
    if (r.ok) { const refreshed = await fetch("/api/admin/questions", { cache: "no-store" }).then(x => x.json()); setQuestions(refreshed.questions); }
  }
  return <main className="admin-page shell">
    <nav className="admin-nav"><Link className="brand" href="/"><span className="brand-mark">∑</span><span>mathlet admin</span></Link><Link href="/admin">Approvals</Link></nav>
    <div className="eyebrow">CONTENT EDITOR</div><h1>Structure questions</h1>
    <p className="admin-intro">Clean the extracted text, then add visual blocks for the learner-facing explanation.</p>
    {message && <p className="auth-message">{message}</p>}
    <div className="editor-layout">
      <div className="question-list">{questions.map(q => <button className={selected?.id === q.id ? "question-item selected" : "question-item"} key={q.id} onClick={() => choose(q)}>Exercise {q.exercise.exerciseNumber}<small>{q.exercise.sectionId} · Ch {q.exercise.chapterNumber} · {q.exercise.language} · {q.reviewStatus}</small></button>)}</div>
      <div className="editor-form">{selected ? <>
        <div className="eyebrow">EDITING EXERCISE {selected.exercise.exerciseNumber}</div>
        <div className="language-toggle"><button className={language === "en" ? "active" : ""} onClick={() => switchLanguage("en")}>English</button><button className={language === "ta" ? "active" : ""} onClick={() => switchLanguage("ta")}>தமிழ்</button></div>
        <label>Question prompt<textarea className="editor-textarea" value={prompt} onChange={e => setPrompt(e.target.value)} rows={8} /></label>
        <label>Given / data<textarea className="editor-textarea" value={given} onChange={e => setGiven(e.target.value)} rows={4} /></label>
        <label>Answer<textarea className="editor-textarea" value={answer} onChange={e => setAnswer(e.target.value)} rows={3} /></label>
        <label>Solution summary<textarea className="editor-textarea" value={solutionSummary} onChange={e => setSolutionSummary(e.target.value)} rows={4} /></label>
        <label>Visual blocks JSON<textarea className="editor-textarea" value={blocksJson} onChange={e => setBlocksJson(e.target.value)} rows={12} placeholder={'[{"blockType":"formula","latex":"x = 2"}]'} /></label>
        <select value={status} onChange={e => setStatus(e.target.value)}><option>RAW</option><option>CLEANED</option><option>STRUCTURED</option><option>DIAGRAM_ADDED</option><option>SOLUTION_ADDED</option><option>REVIEWED</option><option>PUBLISHED</option></select>
        <button className="complete-button" onClick={save}>Save structured content</button>
      </> : <p>Select a question to edit.</p>}</div>
    </div>
  </main>;
}

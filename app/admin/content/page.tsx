"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { MathText } from "@/components/MathFormula";
import ContentBlocks from "@/app/exercise/[id]/ContentBlocks";

type Translation = {
  language: string;
  prompt: string;
  given: string | null;
  answer: string | null;
  solutionSummary: string | null;
};

type Block = {
  blockType: string;
  text?: string | null;
  latex?: string | null;
  assetUrl?: string | null;
  assetAlt?: string | null;
  metadata?: unknown;
};

type QuestionItem = {
  id: string;
  questionNumber: string;
  reviewStatus: string;
  exercise: {
    exerciseNumber: string;
    language: string;
    sectionId: string;
    chapterNumber: number;
  };
  translations: Translation[];
  blocks: (Block & { language: string })[];
};

export default function ContentAdmin() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [selected, setSelected] = useState<QuestionItem | null>(null);
  const [language, setLanguage] = useState("en");
  const [prompt, setPrompt] = useState("");
  const [given, setGiven] = useState("");
  const [answer, setAnswer] = useState("");
  const [solutionSummary, setSolutionSummary] = useState("");
  const [blocksJson, setBlocksJson] = useState("[]");
  const [status, setStatus] = useState("CLEANED");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadQuestions() {
    try {
      const res = await fetch("/api/admin/questions", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.questions || []);
      } else {
        setMessage(data.error || "Failed to load questions.");
      }
    } catch {
      setMessage("Unable to connect to server.");
    }
  }

  useEffect(() => {
    loadQuestions();
  }, []);

  function choose(q: QuestionItem, lang = language) {
    setSelected(q);
    const t = q.translations.find((x) => x.language === lang) || q.translations[0];
    const blocks = q.blocks
      .filter((x) => x.language === lang)
      .map(({ language: _language, ...block }) => block);

    setPrompt(t?.prompt || "");
    setGiven(t?.given || "");
    setAnswer(t?.answer || "");
    setSolutionSummary(t?.solutionSummary || "");
    setBlocksJson(JSON.stringify(blocks, null, 2));
    setStatus(q.reviewStatus);
    setMessage("");
  }

  function switchLanguage(lang: string) {
    setLanguage(lang);
    if (selected) choose(selected, lang);
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: selected.id,
          language,
          prompt,
          given,
          answer,
          solutionSummary,
          blocksJson,
          reviewStatus: status,
        }),
      });
      const data = await res.json();
      setMessage(res.ok ? "Saved successfully." : data.error);
      if (res.ok) {
        await loadQuestions();
      }
    } catch {
      setMessage("Failed to save. Please check input.");
    } finally {
      setSaving(false);
    }
  }

  let parsedBlocksForPreview: unknown[] = [];
  try {
    const parsed = JSON.parse(blocksJson);
    if (Array.isArray(parsed)) parsedBlocksForPreview = parsed;
  } catch {
    // Keep preview quiet if JSON is being edited
  }

  return (
    <main className="admin-page shell">
      <Navbar subtitle="Curriculum Content Editor" />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "30px 0 10px",
        }}
      >
        <div>
          <div className="eyebrow">CONTENT EDITOR</div>
          <h1 style={{ margin: "6px 0 0" }}>Structure questions</h1>
        </div>
        <Link
          href="/admin"
          style={{
            padding: "9px 14px",
            borderRadius: "6px",
            border: "1px solid var(--line)",
            background: "var(--paper)",
            color: "var(--ink)",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          ← Academic Approvals
        </Link>
      </div>

      <p className="admin-intro">
        Clean the extracted text, add visual blocks, and preview mathematical
        notation in real time.
      </p>

      {message && <p className="auth-message">{message}</p>}

      <div className="editor-layout">
        <div className="question-list">
          {questions.length === 0 ? (
            <p style={{ padding: "15px", color: "var(--muted)", fontSize: "13px" }}>
              No questions found. Check database seeding.
            </p>
          ) : (
            questions.map((q) => (
              <button
                className={
                  selected?.id === q.id
                    ? "question-item selected"
                    : "question-item"
                }
                key={q.id}
                onClick={() => choose(q)}
              >
                Exercise {q.exercise.exerciseNumber} (Q{q.questionNumber})
                <small>
                  {q.exercise.sectionId} · Ch {q.exercise.chapterNumber} ·{" "}
                  {q.reviewStatus}
                </small>
              </button>
            ))
          )}
        </div>

        <div className="editor-form">
          {selected ? (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div className="eyebrow">
                  EDITING EXERCISE {selected.exercise.exerciseNumber} · Q
                  {selected.questionNumber}
                </div>
                <div className="language-toggle" style={{ margin: 0 }}>
                  <button
                    className={language === "en" ? "active" : ""}
                    onClick={() => switchLanguage("en")}
                  >
                    English
                  </button>
                  <button
                    className={language === "ta" ? "active" : ""}
                    onClick={() => switchLanguage("ta")}
                  >
                    தமிழ்
                  </button>
                </div>
              </div>

              <label style={{ display: "block", marginTop: "16px" }}>
                <strong>Question prompt (supports $LaTeX$ notation)</strong>
                <textarea
                  className="editor-textarea"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                />
              </label>

              {/* Live Preview Pane */}
              <div
                style={{
                  background: "#fbfcf8",
                  border: "1px solid var(--line)",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "16px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "'DM Mono', monospace",
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  LIVE PREVIEW:
                </span>
                <div style={{ fontSize: "16px", lineHeight: "1.7" }}>
                  <MathText text={prompt || "(Empty prompt)"} />
                </div>
                {parsedBlocksForPreview.length > 0 && (
                  <ContentBlocks blocks={parsedBlocksForPreview} />
                )}
              </div>

              <label style={{ display: "block" }}>
                <strong>Given / data</strong>
                <textarea
                  className="editor-textarea"
                  value={given}
                  onChange={(e) => setGiven(e.target.value)}
                  rows={3}
                />
              </label>

              <label style={{ display: "block" }}>
                <strong>Answer</strong>
                <textarea
                  className="editor-textarea"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={2}
                />
              </label>

              <label style={{ display: "block" }}>
                <strong>Solution summary</strong>
                <textarea
                  className="editor-textarea"
                  value={solutionSummary}
                  onChange={(e) => setSolutionSummary(e.target.value)}
                  rows={3}
                />
              </label>

              <label style={{ display: "block" }}>
                <strong>Visual blocks JSON</strong>
                <textarea
                  className="editor-textarea"
                  value={blocksJson}
                  onChange={(e) => setBlocksJson(e.target.value)}
                  rows={6}
                  placeholder={'[{"blockType":"formula","latex":"x = 2"}]'}
                />
              </label>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  marginTop: "8px",
                }}
              >
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ flex: 1, margin: 0 }}
                >
                  <option>RAW</option>
                  <option>CLEANED</option>
                  <option>STRUCTURED</option>
                  <option>DIAGRAM_ADDED</option>
                  <option>SOLUTION_ADDED</option>
                  <option>REVIEWED</option>
                  <option>PUBLISHED</option>
                </select>

                <button
                  className="complete-button"
                  onClick={save}
                  disabled={saving}
                  style={{ minWidth: "180px" }}
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </>
          ) : (
            <p style={{ color: "var(--muted)", padding: "40px 0" }}>
              Select a question from the left sidebar to edit and preview its
              content.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

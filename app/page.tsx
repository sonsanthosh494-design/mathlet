"use client";

import { useMemo, useState } from "react";
import curriculum from "../curriculum/class-6-12-curriculum.json";

type Chapter = { chapterNumber: number; titleEnglish: string; titleTamil: string };
type Section = { code: string; titleEnglish: string; titleTamil: string; chapters: Chapter[] };
type CurriculumClass = { classNumber: number; label: string; sections: Section[] };

export default function HomePage() {
  const classes = curriculum.classes as CurriculumClass[];
  const [selectedClass, setSelectedClass] = useState(6);
  const [language, setLanguage] = useState<"english" | "tamil">("english");
  const current = useMemo(
    () => classes.find((item) => item.classNumber === selectedClass) ?? classes[0],
    [classes, selectedClass],
  );

  return (
    <main className="shell">
      <nav className="nav">
        <div className="brand"><span className="brand-mark">∑</span><span>mathlet</span></div>
        <span className="nav-note">Tamil Nadu Mathematics · Classes 6–12</span>
      </nav>

      <section className="hero">
        <div className="eyebrow">LEARN · PRACTISE · MASTER</div>
        <h1>Mathematics made<br /><span>clearer.</span></h1>
        <p className="hero-copy">A structured learning space for Tamil Nadu State Board Mathematics, from Class 6 foundations to Class 12 mastery.</p>
        <a className="primary-button" href="#classes">Explore curriculum <span>↓</span></a>
        <div className="hero-orbit orbit-one">π</div><div className="hero-orbit orbit-two">x²</div><div className="hero-orbit orbit-three">∫</div>
      </section>

      <section id="classes" className="curriculum-section">
        <div className="section-heading">
          <div><div className="eyebrow">YOUR CURRICULUM</div><h2>Choose your class</h2></div>
          <div className="language-toggle">
            <button className={language === "english" ? "active" : ""} onClick={() => setLanguage("english")}>English</button>
            <button className={language === "tamil" ? "active" : ""} onClick={() => setLanguage("tamil")}>தமிழ்</button>
          </div>
        </div>

        <div className="class-grid">
          {classes.map((item) => (
            <button key={item.classNumber} className={item.classNumber === selectedClass ? "class-card selected" : "class-card"} onClick={() => setSelectedClass(item.classNumber)}>
              <span className="class-number">{item.classNumber}</span>
              <span className="class-label">{language === "english" ? item.label : `வகுப்பு ${item.classNumber}`}</span>
              <span className="arrow">↗</span>
            </button>
          ))}
        </div>

        <div className="chapter-panel">
          <div className="panel-header"><div><div className="eyebrow">CLASS {current.classNumber}</div><h3>{language === "english" ? current.label : `வகுப்பு ${current.classNumber}`}</h3></div><span className="chapter-count">{current.sections.reduce((sum, section) => sum + section.chapters.length, 0)} chapters</span></div>
          <div className="sections">
            {current.sections.map((section) => (
              <div className="section-block" key={section.code}>
                <div className="section-title"><span>{section.code}</span><div><strong>{language === "english" ? section.titleEnglish : section.titleTamil}</strong><small>{language === "english" ? section.titleTamil : section.titleEnglish}</small></div></div>
                <div className="chapter-list">
                  {section.chapters.map((chapter) => <div className="chapter-row" key={chapter.chapterNumber}><span className="chapter-index">{String(chapter.chapterNumber).padStart(2, "0")}</span><span>{language === "english" ? chapter.titleEnglish : chapter.titleTamil}</span><span className="row-arrow">→</span></div>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer><span>mathlet</span><span>Built for curious minds in Tamil Nadu.</span></footer>
    </main>
  );
}

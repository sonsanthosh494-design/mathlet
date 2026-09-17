"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import curriculum from "@/curriculum/class-6-12-curriculum.json";
import { Navbar } from "@/components/Navbar";

type Chapter = { number: number; title: string; titleTamil: string };
type Section = { id: string; name: string; chapters: Chapter[] };
type CurriculumClass = { classLevel: number; sections: Section[] };

export default function HomePage() {
  const classes = curriculum.classes as CurriculumClass[];
  const [selectedClass, setSelectedClass] = useState(6);
  const [language, setLanguage] = useState<"english" | "tamil">("english");

  useEffect(() => {
    const saved = localStorage.getItem("mathlet:selectedClass");
    if (saved && !isNaN(Number(saved))) {
      setSelectedClass(Number(saved));
    }
  }, []);

  function handleSelectClass(level: number) {
    setSelectedClass(level);
    localStorage.setItem("mathlet:selectedClass", String(level));
  }

  const current = useMemo(
    () => classes.find((item) => item.classLevel === selectedClass) ?? classes[0],
    [classes, selectedClass]
  );

  return (
    <main className="shell">
      <Navbar subtitle="Tamil Nadu Mathematics · Classes 6–12" />

      <section className="hero">
        <div className="eyebrow">LEARN · PRACTISE · MASTER</div>
        <h1>
          Mathematics made
          <br />
          <span>clearer.</span>
        </h1>
        <p className="hero-copy">
          A structured learning space for Tamil Nadu State Board Mathematics,
          from Class 6 foundations to Class 12 mastery.
        </p>
        <a className="primary-button" href="#classes">
          Explore curriculum <span>↓</span>
        </a>
        <div className="hero-orbit orbit-one">π</div>
        <div className="hero-orbit orbit-two">x²</div>
        <div className="hero-orbit orbit-three">∫</div>
      </section>

      <section id="classes" className="curriculum-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">YOUR CURRICULUM</div>
            <h2>Choose your class</h2>
          </div>
          <div className="language-toggle">
            <button
              className={language === "english" ? "active" : ""}
              onClick={() => setLanguage("english")}
            >
              English
            </button>
            <button
              className={language === "tamil" ? "active" : ""}
              onClick={() => setLanguage("tamil")}
            >
              தமிழ்
            </button>
          </div>
        </div>

        <div className="class-grid">
          {classes.map((item) => (
            <button
              key={item.classLevel}
              className={item.classLevel === selectedClass ? "class-card selected" : "class-card"}
              onClick={() => handleSelectClass(item.classLevel)}
            >
              <span className="class-number">{item.classLevel}</span>
              <span className="class-label">
                {language === "english" ? `Class ${item.classLevel}` : `வகுப்பு ${item.classLevel}`}
              </span>
              <span className="arrow">↗</span>
            </button>
          ))}
        </div>

        <div className="chapter-panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">CLASS {current.classLevel}</div>
              <h3>
                {language === "english"
                  ? `Class ${current.classLevel}`
                  : `வகுப்பு ${current.classLevel}`}
              </h3>
            </div>
            <span className="chapter-count">
              {current.sections.reduce((sum, section) => sum + section.chapters.length, 0)} chapters
            </span>
          </div>

          <div className="sections">
            {current.sections.map((section) => (
              <div className="section-block" key={section.id}>
                <div className="section-title">
                  <span>{section.name}</span>
                </div>
                <div className="chapter-list">
                  {section.chapters.map((chapter) => (
                    <Link
                      className="chapter-row"
                      href={`/class/${current.classLevel}/${section.id}/${chapter.number}`}
                      key={chapter.number}
                    >
                      <span className="chapter-index">
                        {String(chapter.number).padStart(2, "0")}
                      </span>
                      <span>
                        {language === "english" ? chapter.title : chapter.titleTamil}
                      </span>
                      <span className="row-arrow">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer>
        <span>mathlet</span>
        <span>Built for curious minds in Tamil Nadu.</span>
      </footer>
    </main>
  );
}

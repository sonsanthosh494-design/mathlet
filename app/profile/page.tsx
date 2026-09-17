"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";

type AcademicRecord = {
  id: string;
  school: string;
  classLevel: number;
  rollNumber: string;
  academicYear: string;
  status: string;
};

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [form, setForm] = useState({
    school: "",
    classLevel: "6",
    rollNumber: "",
    academicYear: "2026-27",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadProfile() {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Please sign in to view your profile.");
        return;
      }
      setName(data.name);
      setEmail(data.email);
      setRecords(data.records || []);

      const latest = data.records?.[0];
      if (latest) {
        setForm({
          school: latest.school,
          classLevel: String(latest.classLevel),
          rollNumber: latest.rollNumber,
          academicYear: latest.academicYear,
        });
      }
    } catch {
      setError("Unable to load profile information.");
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      if (res.ok) {
        await loadProfile();
      }
    } catch {
      setMessage("Failed to submit update. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell" style={{ paddingBottom: "80px" }}>
      <Navbar subtitle="Learner Profile" />

      <div style={{ maxWidth: "760px", margin: "40px auto 0" }}>
        <div className="profile-card" style={{ width: "100%" }}>
          {error ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <h1>Profile unavailable</h1>
              <p style={{ color: "var(--muted)", margin: "16px 0 24px" }}>
                {error}
              </p>
              <Link className="primary-button" href="/login">
                Sign in to your account
              </Link>
            </div>
          ) : (
            <>
              <div className="eyebrow">LEARNER PROFILE</div>
              <h1>{name || "Learner"}</h1>
              <p className="profile-email">{email}</p>

              <h2>Academic details</h2>
              {records.length === 0 ? (
                <p style={{ color: "var(--muted)", fontSize: "14px" }}>
                  No academic records submitted yet.
                </p>
              ) : (
                records.map((record) => (
                  <div className="record-card" key={record.id}>
                    <div>
                      <strong>{record.school}</strong>
                      <span>
                        Class {record.classLevel} · Roll no. {record.rollNumber}
                      </span>
                      <small>Academic year: {record.academicYear}</small>
                    </div>
                    <em className={record.status === "APPROVED" ? "approved" : ""}>
                      {record.status}
                    </em>
                  </div>
                ))
              )}

              <h2>Request an update</h2>
              <form className="profile-form" onSubmit={handleSubmit}>
                <label style={{ fontSize: "12px", color: "var(--muted)" }}>
                  School Name
                  <input
                    required
                    placeholder="School name"
                    value={form.school}
                    onChange={(e) => setForm({ ...form, school: e.target.value })}
                  />
                </label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <label style={{ fontSize: "12px", color: "var(--muted)" }}>
                    Class Level
                    <select
                      value={form.classLevel}
                      onChange={(e) =>
                        setForm({ ...form, classLevel: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "13px",
                        borderRadius: "6px",
                        border: "1px solid var(--line)",
                        background: "#fafcf4",
                        fontFamily: "Manrope, Arial, sans-serif",
                        fontSize: "14px",
                        color: "var(--ink)",
                      }}
                    >
                      {[6, 7, 8, 9, 10, 11, 12].map((lvl) => (
                        <option key={lvl} value={lvl}>
                          Class {lvl}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label style={{ fontSize: "12px", color: "var(--muted)" }}>
                    Roll Number
                    <input
                      required
                      placeholder="Roll number"
                      value={form.rollNumber}
                      onChange={(e) =>
                        setForm({ ...form, rollNumber: e.target.value })
                      }
                    />
                  </label>
                </div>

                <label style={{ fontSize: "12px", color: "var(--muted)" }}>
                  Academic Year
                  <input
                    required
                    placeholder="Academic year (e.g. 2026-27)"
                    value={form.academicYear}
                    onChange={(e) =>
                      setForm({ ...form, academicYear: e.target.value })
                    }
                  />
                </label>

                <button
                  className="complete-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit for approval"}
                </button>
              </form>

              {message && <p className="auth-message">{message}</p>}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    school: "",
    classLevel: "6",
    rollNumber: "",
    academicYear: "2026-27",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setMessage("Account created successfully! You can now sign in.");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        setIsSuccess(false);
        setMessage(data.error || "Unable to create account.");
      }
    } catch {
      setIsSuccess(false);
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-card" style={{ maxWidth: "520px" }}>
        <Link className="brand" href="/">
          <span className="brand-mark">∑</span>
          <span>mathlet</span>
        </Link>

        <div className="eyebrow">CREATE ACCOUNT</div>
        <h1>Start learning.</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              id="reg-name"
              required
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="form-group">
            <input
              id="reg-email"
              required
              type="email"
              placeholder="Email address"
              autoComplete="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div className="form-group">
            <input
              id="reg-password"
              required
              type="password"
              minLength={8}
              placeholder="Password (minimum 8 characters)"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
          </div>

          <div className="form-group">
            <input
              id="reg-school"
              required
              type="text"
              placeholder="School name (e.g. Government HSS, Chennai)"
              value={form.school}
              onChange={(e) => handleChange("school", e.target.value)}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <div className="form-group">
              <select
                id="reg-class"
                value={form.classLevel}
                onChange={(e) => handleChange("classLevel", e.target.value)}
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
            </div>

            <div className="form-group">
              <input
                id="reg-roll"
                required
                type="text"
                placeholder="Roll number"
                value={form.rollNumber}
                onChange={(e) => handleChange("rollNumber", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <input
              id="reg-year"
              required
              type="text"
              placeholder="Academic year (e.g. 2026-27)"
              value={form.academicYear}
              onChange={(e) => handleChange("academicYear", e.target.value)}
            />
          </div>

          <button className="complete-button" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {message && (
          <p
            className="auth-message"
            style={{ color: isSuccess ? "#617b45" : "#9a5a4f" }}
          >
            {message}
          </p>
        )}

        <p className="auth-link">
          Already registered? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
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
  learner: {
    name: string | null;
    user: { email: string } | null;
  };
};

export default function AdminPage() {
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function loadRecords() {
    try {
      const res = await fetch("/api/admin/academic-records", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load records.");
        return;
      }
      setRecords(data.records || []);
      setError("");
    } catch {
      setError("Unable to connect to server.");
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  async function approve(record: AcademicRecord) {
    setBusy(record.id);
    try {
      const res = await fetch("/api/admin/academic-records", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...record, status: "APPROVED" }),
      });
      if (res.ok) {
        await loadRecords();
      } else {
        const data = await res.json();
        setError(data.error || "Approval failed.");
      }
    } catch {
      setError("Failed to approve record.");
    } finally {
      setBusy("");
    }
  }

  return (
    <main className="shell" style={{ paddingBottom: "80px" }}>
      <Navbar subtitle="Admin Control" />

      <div style={{ maxWidth: "980px", margin: "40px auto 0" }}>
        <div className="admin-card" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
              borderBottom: "1px solid var(--line)",
              paddingBottom: "16px",
            }}
          >
            <div>
              <div className="eyebrow">ADMIN CONTROL</div>
              <h1 style={{ margin: "6px 0 0" }}>Academic Approvals</h1>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Link
                href="/admin/content"
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
                Content Editor →
              </Link>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <p className="admin-intro" style={{ margin: 0 }}>
              Review learner school and class details before they become approved
              records.
            </p>
            <button className="refresh-button" style={{ margin: 0 }} onClick={loadRecords}>
              ↻ Refresh records
            </button>
          </div>

          {error && <div className="admin-error">{error}</div>}

          {records.length === 0 ? (
            <div className="exercise-empty">
              <strong>No academic records found</strong>
              <p>New learner registrations will appear here for verification.</p>
            </div>
          ) : (
            <div className="admin-records">
              {records.map((record) => (
                <div className="admin-record" key={record.id}>
                  <div>
                    <strong>{record.learner.name || "Unnamed Learner"}</strong>
                    <span>{record.learner.user?.email}</span>
                    <p>
                      {record.school} · Class {record.classLevel} · Roll no.{" "}
                      {record.rollNumber} · {record.academicYear}
                    </p>
                  </div>
                  <div>
                    <em
                      className={
                        record.status === "APPROVED" ? "approved" : ""
                      }
                    >
                      {record.status}
                    </em>
                    {record.status !== "APPROVED" && (
                      <button
                        className="complete-button"
                        disabled={busy === record.id}
                        onClick={() => approve(record)}
                      >
                        {busy === record.id ? "Saving..." : "Approve"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

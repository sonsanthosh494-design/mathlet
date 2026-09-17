"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface NavbarProps {
  subtitle?: string;
}

type UserState = {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    role: string;
    name: string | null;
  } | null;
};

export function Navbar({ subtitle = "Tamil Nadu Mathematics · Classes 6–12" }: NavbarProps) {
  const router = useRouter();
  const [auth, setAuth] = useState<UserState | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setAuth(data);
      })
      .catch(() => {
        setAuth({ authenticated: false, user: null });
      });
  }, []);

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuth({ authenticated: false, user: null });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="nav-container">
      <nav className="nav">
        <Link className="brand" href="/">
          <span className="brand-mark">∑</span>
          <span>mathlet</span>
        </Link>

        {subtitle && <span className="nav-note">{subtitle}</span>}

        <button
          className="nav-mobile-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>

        <div className={`nav-links ${isMenuOpen ? "open" : ""}`}>
          <Link className="nav-link" href="/#classes" onClick={() => setIsMenuOpen(false)}>
            Curriculum
          </Link>

          {auth?.authenticated && auth.user ? (
            <>
              {auth.user.role === "ADMIN" && (
                <Link className="nav-link admin-pill" href="/admin" onClick={() => setIsMenuOpen(false)}>
                  Admin
                </Link>
              )}
              <Link className="nav-link user-link" href="/profile" onClick={() => setIsMenuOpen(false)}>
                {auth.user.name || auth.user.email.split("@")[0]}
              </Link>
              <button
                className="nav-button-secondary"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleSignOut();
                }}
              >
                Sign out
              </button>
            </>
          ) : auth !== null ? (
            <>
              <Link className="nav-link" href="/login" onClick={() => setIsMenuOpen(false)}>
                Sign in
              </Link>
              <Link className="nav-button-primary" href="/register" onClick={() => setIsMenuOpen(false)}>
                Register
              </Link>
            </>
          ) : null}
        </div>
      </nav>
    </header>
  );
}

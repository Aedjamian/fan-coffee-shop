"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [devBypassEnabled, setDevBypassEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/auth/dev-bypass")
      .then((r) => r.json())
      .then((data: { enabled?: boolean }) => setDevBypassEnabled(Boolean(data.enabled)))
      .catch(() => setDevBypassEnabled(false));
  }, []);

  async function devBypass() {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/dev-bypass", { method: "POST" });
      if (!response.ok) {
        setError("Dev bypass is not available.");
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-shell">
      <div className="admin-card admin-login-card">
        <Link href="/" className="admin-back">
          ← Back to site
        </Link>
        <h1>Admin login</h1>
        <p className="admin-muted">
          Sign in to update menu items and site copy for F.A.N Coffee Shop.
        </p>
        <form onSubmit={onSubmit} className="admin-form">
          <label>
            Username
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? <p className="admin-error">{error}</p> : null}
          <button type="submit" className="btn btn-primary admin-btn" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        {devBypassEnabled ? (
          <div className="admin-dev-bypass">
            <p className="admin-muted">Development only</p>
            <button
              type="button"
              className="btn btn-secondary admin-btn admin-btn-full"
              disabled={loading}
              onClick={devBypass}
            >
              Skip login (dev bypass)
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

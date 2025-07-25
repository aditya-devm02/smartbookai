"use client";
import React, { useState } from "react";
import NavBar from "../components/NavBar";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      setSuccess("Login successful! Redirecting...");
      // Save token and redirect if needed
      if (data.token) localStorage.setItem("token", data.token);
      window.location.href = "/activities";
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed');
      }
    }
    setLoading(false);
  };

  return (
    <>
      <NavBar />
      <main style={{ minHeight: "100vh", background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center", padding: '0 8px' }}>
        <div style={{ background: "var(--card-bg)", borderRadius: 16, boxShadow: "0 4px 24px #0008", padding: 'clamp(18px, 6vw, 40px)', maxWidth: 400, width: "100%", margin: "auto", border: "2px solid var(--primary)" }}>
          <h2 style={{ color: "var(--primary)", fontWeight: 900, fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: 24, letterSpacing: 1 }}>Login</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%", marginBottom: 12, fontSize: '1rem', padding: '10px 12px' }} disabled={loading} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: "100%", marginBottom: 12, fontSize: '1rem', padding: '10px 12px' }} disabled={loading} />
            <button type="submit" style={{ width: "100%", marginTop: 8, fontSize: '1.1rem', fontWeight: 800, letterSpacing: 0.5, padding: '12px 0', borderRadius: 8 }} disabled={loading}>Login</button>
          </form>
          {error && <p style={{ color: "var(--primary)", background: "#2a0000", borderRadius: 6, padding: 10, marginTop: 18, fontWeight: 700, textAlign: "center" }}>{error}</p>}
          {success && <p style={{ color: "var(--accent)", background: "#1a1a00", borderRadius: 6, padding: 10, marginTop: 18, fontWeight: 700, textAlign: "center" }}>{success}</p>}
        </div>
      </main>
    </>
  );
} 
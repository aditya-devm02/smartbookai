"use client";
import React, { useState } from "react";
import NavBar from "../components/NavBar";

export default function AdminSignup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventSlug, setEventSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [secondaryColor, setSecondaryColor] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          eventName,
          eventSlug,
          branding: {
            logoUrl,
            primaryColor,
            secondaryColor
          }
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Admin signup failed");
      setSuccess("Admin signup successful! Please login.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Admin signup failed');
      }
    }
    setLoading(false);
  };

  return (
    <>
      <NavBar />
      <main style={{ minHeight: "100vh", background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "var(--card-bg)", borderRadius: 16, boxShadow: "0 4px 24px #0008", padding: 40, maxWidth: 400, width: "100%", margin: "auto", border: "2px solid var(--primary)" }}>
          <h2 style={{ color: "var(--primary)", fontWeight: 900, fontSize: 32, marginBottom: 24, letterSpacing: 1 }}>Admin Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required style={{ width: "100%", marginBottom: 16 }} disabled={loading} />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%", marginBottom: 16 }} disabled={loading} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: "100%", marginBottom: 16 }} disabled={loading} />
            <input type="text" placeholder="Event Name" value={eventName} onChange={e => setEventName(e.target.value)} required style={{ width: "100%", marginBottom: 16 }} disabled={loading} />
            <input type="text" placeholder="Event Slug (URL)" value={eventSlug} onChange={e => setEventSlug(e.target.value)} required style={{ width: "100%", marginBottom: 16 }} disabled={loading} />
            <input type="url" placeholder="Logo URL" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} style={{ width: "100%", marginBottom: 16 }} disabled={loading} />
            <input type="text" placeholder="Primary Color (e.g. #007cf0)" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ width: "100%", marginBottom: 16 }} disabled={loading} />
            <input type="text" placeholder="Secondary Color (e.g. #ff0080)" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} style={{ width: "100%", marginBottom: 16 }} disabled={loading} />
            <button type="submit" style={{ width: "100%", marginTop: 8, fontSize: 18, fontWeight: 800, letterSpacing: 0.5 }} disabled={loading}>Sign Up</button>
          </form>
          {error && <p style={{ color: "var(--primary)", background: "#2a0000", borderRadius: 6, padding: 10, marginTop: 18, fontWeight: 700, textAlign: "center" }}>{error}</p>}
          {success && <p style={{ color: "var(--accent)", background: "#1a1a00", borderRadius: 6, padding: 10, marginTop: 18, fontWeight: 700, textAlign: "center" }}>{success}</p>}
        </div>
      </main>
    </>
  );
} 
"use client";
import React, { useState, Suspense } from 'react';
import NavBar from "../components/NavBar";
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import Image from "next/image";

function SignupInner() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [event, setEvent] = useState<{ name?: string; branding?: { logoUrl?: string } } | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const eventSlug = searchParams?.get('eventSlug');

  useEffect(() => {
    if (!eventSlug) {
      setLoading(false);
      return;
    }
    // Fetch event details
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/slug/${eventSlug}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.slug) {
          setEvent(data);
        } else {
          setError('Event not found. Please check your link or contact your organizer.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Could not fetch event details.');
        setLoading(false);
      });
  }, [eventSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const body: { username: string; email: string; password: string; eventSlug?: string } = { username, email, password };
      if (eventSlug) body.eventSlug = eventSlug;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      setSuccess('Signup successful! Please login.');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Signup failed');
      }
    }
  };

  return (
    <>
      <NavBar />
      <main style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--card-bg)', borderRadius: 16, boxShadow: '0 4px 24px #0008', padding: 40, maxWidth: 400, width: '100%', margin: 'auto', border: '2px solid var(--primary)' }}>
          <h2 style={{ color: 'var(--primary)', fontWeight: 900, fontSize: 32, marginBottom: 24, letterSpacing: 1 }}>Sign Up</h2>
          {loading ? <p>Loading event details...</p> : event && (
            <div style={{ marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 20 }}>{event.name}</div>
              {event.branding?.logoUrl && <Image src={event.branding.logoUrl} alt="Event Logo" width={120} height={60} style={{ maxWidth: 120, margin: '12px auto' }} />}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%', marginBottom: 16 }} disabled={loading} />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', marginBottom: 16 }} disabled={loading} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', marginBottom: 16 }} disabled={loading} />
            <button type="submit" style={{ width: '100%', marginTop: 8, fontSize: 18, fontWeight: 800, letterSpacing: 0.5 }} disabled={loading}>Sign Up</button>
          </form>
          {error && <p style={{ color: 'var(--primary)', background: '#2a0000', borderRadius: 6, padding: 10, marginTop: 18, fontWeight: 700, textAlign: 'center' }}>{error}</p>}
          {success && <p style={{ color: 'var(--accent)', background: '#1a1a00', borderRadius: 6, padding: 10, marginTop: 18, fontWeight: 700, textAlign: 'center' }}>{success}</p>}
        </div>
      </main>
    </>
  );
}

export default function Signup() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupInner />
    </Suspense>
  );
} 
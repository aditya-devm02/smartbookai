"use client";
import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Image from "next/image";

type Booking = {
  _id: string;
  activity: {
    title: string;
    date: string;
    category: string;
    description?: string;
    duration?: number;
    imageUrl?: string; // Added for activity logo
  };
  bookingDate: string;
  paymentStatus?: string;
  paymentProof?: string;
  paymentTxnId?: string;
};

type User = {
  id: string;
  username: string;
  email: string;
};

// Define Event type
interface EventBranding {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}
interface EventType {
  name?: string;
  slug?: string;
  category?: string;
  date?: string;
  description?: string;
  branding?: EventBranding;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventId, setEventId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [event, setEvent] = useState<EventType | null>(null);

  console.log("Profile page rendered");
  // Get user from token and eventId
  useEffect(() => {
    setToken(typeof window !== 'undefined' ? localStorage.getItem("token") : null);
  }, []);

  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("[Profile] User after decode:", payload);
      setUser({ id: payload.userId, username: payload.username, email: payload.email });
      setEventId(payload.eventId);
    } catch {
      setUser(null);
      setEventId(null);
    }
  }, [token]);

  // Fetch event details
  useEffect(() => {
    if (!eventId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}`)
      .then(res => res.json())
      .then(data => setEvent(data));
  }, [eventId]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      console.log("Fetching bookings from:", `${API_URL}/api/bookings/my`);
      const token = localStorage.getItem("token");
      if (!token || !user) return;
      try {
        const res = await fetch(`${API_URL}/api/bookings/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("Bookings API response:", data);
        setBookings(data.bookings || []);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError("Failed to load bookings.");
        } else {
          setError("Failed to load bookings.");
        }
      }
    };
    fetchBookings();
  }, [user]);

  // Fetch recommendations
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) {
      setLoading(false);
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommend`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setRecommendations(data.recommendations || []))
      .catch(() => setError("Failed to load recommendations."))
      .finally(() => setLoading(false));
  }, [user]);

  // Add debug logs
  useEffect(() => {
    console.log("[Profile] user:", user);
    console.log("[Profile] bookings:", bookings);
    console.log("[Profile] recommendations:", recommendations);
    console.log("[Profile] error:", error);
  }, [user, bookings, recommendations, error]);

  if (token === null) {
    return (
      <>
        {/* <div className={styles.bgAnimated} /> */}
        <NavBar />
        <main style={{ minHeight: '100vh', background: 'none', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#00dfd8', fontWeight: 700, fontSize: 28 }}>Loading profile...</div>
        </main>
      </>
    );
  }

  if (!token) {
    return (
      <>
        {/* <div className={styles.bgAnimated} /> */}
        <NavBar />
        <main style={{ minHeight: '100vh', background: 'none', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ maxWidth: 420, width: '100%', margin: 'auto', textAlign: 'center', padding: 48 }}>
            <h2 style={{ fontSize: 32, marginBottom: 18 }}>Profile</h2>
            <div style={{ color: '#ff0080', fontWeight: 700, fontSize: 20 }}>Please log in to view your profile.</div>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        {/* <div className={styles.bgAnimated} /> */}
        <NavBar />
        <main style={{ minHeight: '100vh', background: 'none', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#00dfd8', fontWeight: 700, fontSize: 28 }}>Loading profile...</div>
        </main>
      </>
    );
  }

  return (
    <>
      {/* <div className={styles.bgAnimated} /> */}
      <NavBar />
      <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #181824 0%, #23234a 100%)', padding: 0 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(24px, 6vw, 56px) 8px 40px 8px' }}>
          {/* Event info header */}
          {event && (
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginLeft: 8, marginBottom: 36, gap: 24 }}>
              {event.branding?.logoUrl && (
                <Image src={event.branding.logoUrl} alt="Event Logo" width={90} height={90} style={{ objectFit: 'contain', borderRadius: 18, background: '#fff', marginRight: 0, boxShadow: '0 4px 24px #007cf022' }} />
              )}
              <div style={{ minWidth: 180 }}>
                <div style={{ color: event.branding?.primaryColor || '#00dfd8', fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontWeight: '800', fontSize: 'clamp(1.2rem, 4vw, 2.1rem)', letterSpacing: '0.5px', marginBottom: 8, textShadow: '0 2px 8px #0002', lineHeight: 1.1 }}>{event.name}</div>
                <div style={{ color: event.branding?.secondaryColor || '#ff0080', fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontWeight: '600', fontSize: '1.1rem', marginBottom: 10, letterSpacing: '0.2px', textShadow: '0 1px 4px #0001', lineHeight: 1.1 }}>{event.slug}</div>
                {event.category && <div style={{ color: '#007cf0', fontWeight: 500, fontSize: '1rem', marginBottom: 4, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>Category: {event.category}</div>}
                {event.date && <div style={{ color: '#232323', fontWeight: 500, fontSize: '1rem', marginBottom: 4, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>Date: {new Date(event.date).toLocaleDateString()}</div>}
                {event.description && <div style={{ color: '#232323', fontSize: '1rem', marginTop: 4, opacity: 0.85, fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>{event.description}</div>}
              </div>
            </div>
          )}
          {/* User card */}
          <div className="card" style={{ background: 'rgba(24,24,40,0.92)', borderRadius: 22, boxShadow: '0 4px 32px #007cf044', padding: 'clamp(18px, 5vw, 36px)', marginBottom: 48, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 24, border: '1.5px solid #00dfd8', transition: 'box-shadow 0.3s', animation: 'fadeInAnim 1.2s cubic-bezier(.4,2,.6,1) both' }}>
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg, #00dfd8 0%, #7928ca 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: '#fff', fontWeight: 900, boxShadow: '0 2px 12px #007cf022', border: '4px solid #fff', marginBottom: 8 }}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontWeight: 800, fontSize: 'clamp(1.2rem, 5vw, 2rem)', color: '#fff', marginBottom: 8, fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: 0.5, textShadow: '0 2px 8px #0004' }}>{user.username}</div>
              <div style={{ color: '#b0b0b0', fontSize: 'clamp(1rem, 4vw, 1.25rem)', marginBottom: 10, fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontWeight: 500 }}>{user.email}</div>
              <div style={{ color: '#00dfd8', fontWeight: 700, fontSize: 'clamp(1rem, 4vw, 1.3rem)', fontFamily: 'Inter, Segoe UI, Arial, sans-serif', marginTop: 6 }}>Event: {event?.name || 'N/A'}</div>
            </div>
          </div>
          <h2 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.7rem)', marginBottom: 24, marginLeft: 4, textAlign: 'left', color: '#00dfd8', letterSpacing: 1 }}>My Bookings</h2>
          {error && (
            <div style={{ color: '#ff0080', fontWeight: 700, fontSize: 20, margin: '24px 0' }}>{error}</div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
            {!error && bookings.length === 0 ? (
              <div style={{ color: '#00dfd8', fontWeight: 700, fontSize: 20, marginTop: 24, background: 'rgba(0,223,216,0.08)', borderRadius: 12, padding: '16px 32px' }}>No bookings yet. Book your first activity!</div>
            ) : (
              bookings.map((booking, i) => (
                <div key={booking._id} style={{
                  display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 18,
                  background: 'rgba(24,24,40,0.92)', borderRadius: 22, boxShadow: '0 4px 32px #007cf044', padding: 'clamp(14px, 4vw, 28px)', minWidth: 220, maxWidth: 520, color: '#fff', border: '2px solid #00dfd8',
                  animation: 'fadeInAnim 1.2s cubic-bezier(.4,2,.6,1) both', animationDelay: `${i * 0.08 + 0.2}s`, position: 'relative', marginBottom: 8
                }}>
                  {/* Activity logo or fallback */}
                  <div style={{ width: 70, height: 70, borderRadius: 18, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 0, boxShadow: '0 2px 12px #007cf022', marginBottom: 8 }}>
                    {booking.activity?.imageUrl ? (
                      <Image src={booking.activity.imageUrl} alt={booking.activity.title} width={60} height={60} style={{ objectFit: 'cover', borderRadius: 14 }} />
                    ) : (
                      <span style={{ color: '#00dfd8', fontWeight: 900, fontSize: 28 }}>{booking.activity?.title?.charAt(0).toUpperCase() || '?'}</span>
                    )}
                  </div>
                  {/* Activity details */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 6, flex: 1, minWidth: 120 }}>
                    <div style={{ fontWeight: 900, fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', color: '#00dfd8', marginBottom: 2 }}>{booking.activity?.title || 'Activity'}</div>
                    <div style={{ color: '#b0b0b0', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', fontWeight: 500 }}>{booking.activity?.category || ''}</div>
                    <div style={{ color: '#007cf0', fontWeight: 600, fontSize: 'clamp(0.9rem, 3vw, 1.05rem)' }}>Date: {booking.activity?.date ? new Date(booking.activity.date).toLocaleDateString() : 'N/A'}</div>
                    <div style={{ color: '#007cf0', fontWeight: 600, fontSize: 'clamp(0.9rem, 3vw, 1.05rem)' }}>Duration: {booking.activity?.duration || 'N/A'} min</div>
                    {booking.paymentStatus && (
                      <div style={{ fontSize: 'clamp(0.9rem, 3vw, 1.05rem)', fontWeight: 700, margin: '8px 0', color: booking.paymentStatus === 'approved' ? '#00dfd8' : booking.paymentStatus === 'pending' ? '#ffd700' : '#ff0080' }}>
                        Payment: {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Recommendations Section */}
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#aaa', fontWeight: 600, fontSize: 20, margin: '48px 0 24px 0' }}>
              <div style={{ width: 28, height: 28, border: '3px solid #00dfd8', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              Loading recommendations...
            </div>
          ) : error ? (
            <div style={{ marginTop: 48, color: '#ff0080', fontWeight: 700, fontSize: 18 }}>
              Failed to load recommendations. Please try again later.
            </div>
          ) : recommendations.length > 0 ? (
            <div style={{ marginTop: 48 }}>
              <h2 style={{ fontSize: 28, marginBottom: 24, marginLeft: 4, textAlign: 'left', color: '#ff0080', letterSpacing: 1 }}>Recommended for <span style={{ color: '#00dfd8' }}>You</span></h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'flex-start' }}>
                {recommendations.map((rec, i) => (
                  <div key={i} style={{ 
                    background: 'rgba(255,255,255,0.18)', 
                    borderRadius: 16, 
                    boxShadow: '0 2px 12px #007cf022', 
                    padding: '16px 32px', 
                    fontSize: 18, 
                    color: '#00dfd8', 
                    fontWeight: 700, 
                    letterSpacing: 0.5, 
                    border: '1.5px solid #00dfd8', 
                    animation: 'fadeInAnim 1.2s cubic-bezier(.4,2,.6,1) both', 
                    animationDelay: `${i * 0.1 + 0.2}s`,
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    marginBottom: 8
                  }}
                  onMouseOver={e => { 
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)'; 
                    e.currentTarget.style.boxShadow = '0 8px 24px #00dfd844'; 
                  }}
                  onMouseOut={e => { 
                    e.currentTarget.style.transform = 'none'; 
                    e.currentTarget.style.boxShadow = '0 2px 12px #007cf022'; 
                  }}
                  onClick={() => window.location.href = '/activities'}
                  >
                    {rec}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, color: '#007cf0', fontSize: 14, fontStyle: 'italic' }}>
                Click on a recommendation to view all activities
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 48 }}>
              <h2 style={{ fontSize: 28, marginBottom: 24, marginLeft: 4, textAlign: 'left', color: '#ff0080', letterSpacing: 1 }}>Recommended for <span style={{ color: '#00dfd8' }}>You</span></h2>
              <div style={{ color: '#007cf0', fontWeight: 600, fontSize: 18, fontStyle: 'italic' }}>
                Start booking activities to get personalized recommendations!
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
} 
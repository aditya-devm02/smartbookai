"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import NavBar from "../components/NavBar";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

type Activity = {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  duration?: number;
  slots: number;
  popularity?: number;
  imageUrl?: string;
  maxTeammates?: number; // Added maxTeammates
  fee?: number; // Added fee
  upiId?: string; // Added upiId
};

const categories = ["all", "wellness", "sports", "music", "art", "tech"];

export default function Activities() {
  if (typeof window !== 'undefined') { console.log('ACTIVITIES PAGE LOADED'); }
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [date, setDate] = useState("");
  const [minDuration, setMinDuration] = useState("");
  const [maxDuration, setMaxDuration] = useState("");
  const [sort, setSort] = useState("");
  const [bookingStatus, setBookingStatus] = useState<{ [id: string]: string }>({});
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [recLoading, setRecLoading] = useState(true);
  const [event, setEvent] = useState<{ name: string; slug: string; category?: string; date?: string; description?: string; branding?: { logoUrl?: string; primaryColor?: string; secondaryColor?: string } } | null>(null);
  // Add state for teammate modal
  const [teammateModal, setTeammateModal] = useState<{ activity: Activity | null, count: number, teammates: { name: string, email: string }[] }>({ activity: null, count: 0, teammates: [] });
  const [paymentProof, setPaymentProof] = useState<string>("");
  const [paymentTxnId, setPaymentTxnId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Add state for payment upload
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fetchActivities = useCallback(() => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    let eventId = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        eventId = payload.eventId;
      } catch {}
    }
    if (!eventId) {
      setActivities([]);
      setLoading(false);
      return;
    }
    const params = new URLSearchParams();
    if (category !== "all") params.append("category", category);
    if (date) params.append("date", date);
    if (minDuration) params.append("minDuration", minDuration);
    if (maxDuration) params.append("maxDuration", maxDuration);
    if (sort) params.append("sort", sort);
    params.append("eventId", eventId);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activities?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setActivities(data);
        setLoading(false);
      });
  }, [category, date, minDuration, maxDuration, sort]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setRecLoading(false);
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommend`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setRecommendations(data.recommendations || []))
      .finally(() => setRecLoading(false));
  }, []);

  // Fetch event data
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;
    let eventId = null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      eventId = payload.eventId;
    } catch {}
    if (!eventId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}`)
      .then(res => res.json())
      .then(data => {
        console.log("Fetched event data:", data); // Debug log
        setEvent(data);
      });
  }, []);

  const handleBook = async (activityId: string, teammates?: { name: string, email: string }[], paymentProof?: string, paymentTxnId?: string) => {
    setBookingId(activityId);
    setBookingStatus(prev => ({ ...prev, [activityId]: "" }));
    const token = localStorage.getItem("token");
    if (!token) {
      setBookingStatus(prev => ({ ...prev, [activityId]: "Please log in to book an activity." }));
      setBookingId(null);
      toast.error("Please log in to book an activity.");
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          activityId,
          teammates,
          paymentProof,
          paymentTxnId
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");
      setBookingStatus(prev => ({ ...prev, [activityId]: "Booking successful!" }));
      toast.success("Booking successful!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Booking failed";
      setBookingStatus(prev => ({ ...prev, [activityId]: errorMessage }));
      toast.error(errorMessage);
    }
    setBookingId(null);
    setTeammateModal({ activity: null, count: 0, teammates: [] });
    setPaymentProof("");
    setPaymentTxnId("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // When opening the modal, default count to 1 if teammates are required
  const openTeammateModal = (activity: Activity) => {
    // Debug log to verify activity object
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log('DEBUG: Opening teammate modal for activity:', activity);
    }
    const count = activity.maxTeammates && activity.maxTeammates > 0 ? 1 : 0;
    setTeammateModal({ activity, count, teammates: [] });
    setPaymentProof("");
    setPaymentTxnId("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Debug log in render
  console.log("Rendering event info block with event:", event);
  if (event) {
    try { console.log("Event JSON:", JSON.stringify(event)); } catch (e) { console.log("Event JSON error", e); }
  }
  return (
    <>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: 'var(--card-bg)',
          color: 'var(--foreground)',
          fontWeight: 700,
          fontSize: 16,
          border: '2px solid var(--primary)',
          borderRadius: 10,
          boxShadow: '0 4px 24px #0008',
          padding: '16px 24px',
        },
        success: { style: { background: 'var(--accent)', color: '#181818' } },
        error: { style: { background: 'var(--primary)', color: '#fff' } },
      }} />
      <NavBar />
      <main style={{ padding: 0, background: "var(--background)", minHeight: "100vh" }}>
        {/* Only render event name and slug ONCE at the top */}
        {event && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto', marginTop: 40, marginBottom: 24, maxWidth: 900, width: '100%'
          }}>
            <h1 style={{ color: event.branding?.primaryColor || '#007cf0', fontWeight: 900, fontSize: 'clamp(2rem, 7vw, 3.2rem)', letterSpacing: 1, marginBottom: 0, textAlign: 'center' }}>{event.name}</h1>
            <h2 style={{ color: event.branding?.secondaryColor || '#ff0080', fontWeight: 800, fontSize: 'clamp(1.2rem, 5vw, 2.2rem)', marginBottom: 24, textAlign: 'center', letterSpacing: 1 }}>{event.slug}</h2>
          </div>
        )}
        {/* Filter Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto', marginBottom: 32, width: '100%', maxWidth: 700 }}>
          <form style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 0, width: '100%', maxWidth: 700 }}>
            <label style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>Category:
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ marginLeft: 8, padding: '8px 12px', borderRadius: 8, fontSize: 16, minWidth: 90 }}>
                {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
              </select>
            </label>
            <label style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>Date:
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ marginLeft: 8, padding: '8px 12px', borderRadius: 8, fontSize: 16 }} />
            </label>
            <label style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>Min Duration (min):
              <input type="number" value={minDuration} onChange={e => setMinDuration(e.target.value)} style={{ marginLeft: 8, padding: '8px 12px', borderRadius: 8, fontSize: 16, width: 80 }} />
            </label>
            <label style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>Max Duration (min):
              <input type="number" value={maxDuration} onChange={e => setMaxDuration(e.target.value)} style={{ marginLeft: 8, padding: '8px 12px', borderRadius: 8, fontSize: 16, width: 80 }} />
            </label>
            <label style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>Sort by:
              <select value={sort} onChange={e => setSort(e.target.value)} style={{ marginLeft: 8, padding: '8px 12px', borderRadius: 8, fontSize: 16, minWidth: 90 }}>
                <option value="">None</option>
                <option value="popularity">Popularity</option>
                <option value="duration">Duration</option>
                <option value="slots">Slots</option>
              </select>
            </label>
          </form>
          <style>{`
            @media (max-width: 600px) {
              form {
                flex-direction: column !important;
                align-items: stretch !important;
                gap: 12px !important;
              }
              form label {
                width: 100% !important;
                font-size: 15px !important;
              }
              form input, form select {
                width: 100% !important;
                font-size: 1rem !important;
              }
            }
          `}</style>
        </div>
        {/* Only render Recommended for You section ONCE, below filter bar */}
        {!recLoading && recommendations.length > 0 && (
          <div style={{ maxWidth: 900, margin: '0 auto 32px auto', width: '100%', paddingLeft: 12 }}>
            <h2 style={{ color: '#00dfd8', fontWeight: 800, fontSize: 22, marginBottom: 12, textAlign: 'left' }}>Recommended for You</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {recommendations.map((rec, i) => (
                <div key={i} style={{ background: 'rgba(0,223,216,0.08)', border: '2px solid #00dfd8', borderRadius: 12, color: '#00dfd8', fontWeight: 700, fontSize: 18, padding: '8px 18px', marginBottom: 8, cursor: 'pointer', transition: 'transform 0.2s', minWidth: 80 }} onClick={() => window.location.href = '/activities'}>{rec}</div>
              ))}
            </div>
          </div>
        )}
        {/* Responsive activity cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, margin: '32px auto', maxWidth: 1200, padding: '0 8px' }}>
          {activities.length === 0 && !loading ? (
            <div style={{ color: '#00dfd8', fontWeight: 700, fontSize: 22, marginTop: 32 }}>No activities found for your event.</div>
          ) : null}
          {activities.map((activity, i) => (
            <div key={activity._id} style={{ background: 'rgba(255,255,255,0.13)', borderRadius: 22, boxShadow: '0 4px 32px #007cf022', padding: 32, minWidth: 280, maxWidth: 340, margin: '0 0 24px 0', color: '#fff', border: '1.5px solid #3333', position: 'relative', animation: 'fadeInAnim 1.2s cubic-bezier(.4,2,.6,1) both', animationDelay: `${i * 0.08 + 0.2}s`, transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 32px #00dfd844'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 32px #007cf022'; }}
            >
              {(activity.imageUrl || true) && (
                <Image
                  src={activity.imageUrl || 'https://source.unsplash.com/featured/?event,activity'}
                  alt={activity.title}
                  width={340}
                  height={160}
                  style={{
                    width: '100%',
                    height: '160px',
                    objectFit: 'cover',
                    borderTopLeftRadius: '18px',
                    borderTopRightRadius: '18px',
                    marginBottom: 18,
                    boxShadow: '0 2px 12px #007cf022'
                  }}
                />
              )}
              <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 8, color: '#00dfd8', letterSpacing: 0.5 }}>{activity.title}</div>
              <div style={{ fontSize: 16, color: '#e0e0ff', marginBottom: 10 }}>{activity.category} &bull; {new Date(activity.date).toLocaleDateString()}</div>
              <div style={{ fontSize: 15, color: '#fff', marginBottom: 16 }}>{activity.description}</div>
              <div style={{ fontSize: 14, color: '#b2ebf2', marginBottom: 10 }}>Slots: {activity.slots} &nbsp; | &nbsp; Duration: {activity.duration || 'N/A'} min</div>
              {typeof activity.popularity === 'number' && (
                <div style={{ fontSize: 14, color: '#ffd700', marginBottom: 10 }}>
                  Popularity: {activity.popularity}
                </div>
              )}
              <button
                className="primary"
                style={{ width: '100%', fontWeight: 700, fontSize: 17, marginTop: 10, borderRadius: 14 }}
                onClick={() => {
                  console.log('BOOK NOW CLICKED', activity);
                  if (Number(activity.fee) > 0 || (activity.maxTeammates ?? 0) > 0) {
                    openTeammateModal(activity);
                  } else {
                    handleBook(activity._id);
                  }
                }}
                disabled={bookingId === activity._id}
              >
                {bookingId === activity._id ? 'Booking...' : 'Book Now'}
              </button>
              {bookingStatus[activity._id] && <div style={{ color: bookingStatus[activity._id].includes('success') ? '#00dfd8' : '#ff0080', fontWeight: 700, marginTop: 10 }}>{bookingStatus[activity._id]}</div>}
            </div>
          ))}
        </div>
      </main>
      {teammateModal.activity && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(24,24,40,0.65)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(6px)'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.18)',
            borderRadius: 22,
            padding: 36,
            minWidth: 340,
            maxWidth: 440,
            boxShadow: '0 8px 32px #007cf044',
            position: 'relative',
            border: '1.5px solid #00dfd8',
            backdropFilter: 'blur(12px)',
            animation: 'fadeInAnim 0.7s cubic-bezier(.4,2,.6,1) both'
          }}>
            <h2 style={{ color: '#007cf0', fontWeight: 900, fontSize: 26, marginBottom: 10, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span role="img" aria-label="team">👥</span> Add Teammates
            </h2>
            {/* Show teammate count if teammates are required */}
            {(teammateModal.activity?.maxTeammates ?? 0) > 0 && (
              <div style={{ color: '#007cf0', fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
                Teammates: {teammateModal.count} / {teammateModal.activity.maxTeammates}
              </div>
            )}
            {/* Remove stray '0' here (do not render teammateModal.count directly) */}
            { (teammateModal.activity?.maxTeammates ?? 0) > 0 ? (
              <>
                {/* Teammate fields and controls */}
                {Array.from({ length: teammateModal.count }).map((_, i) => {
                  const name = teammateModal.teammates[i]?.name || '';
                  const email = teammateModal.teammates[i]?.email || '';
                  const emailValid = !email || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, background: 'rgba(255,255,255,0.22)', borderRadius: 12, padding: '10px 12px', boxShadow: '0 2px 8px #00dfd822' }}>
                      <span style={{ fontSize: 18, color: '#007cf0', marginRight: 2 }}>#{i + 1}</span>
                      <input
                        type="text"
                        placeholder={`Teammate ${i + 1} Name`}
                        value={name}
                        onChange={e => setTeammateModal(modal => {
                          const teammates = [...modal.teammates];
                          teammates[i] = { ...teammates[i], name: e.target.value };
                          return { ...modal, teammates };
                        })}
                        style={{ width: 120, borderRadius: 8, border: '1.5px solid #00dfd8', padding: '6px 10px', fontWeight: 600, fontSize: 15, marginRight: 6 }}
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setTeammateModal(modal => {
                          const teammates = [...modal.teammates];
                          teammates[i] = { ...teammates[i], email: e.target.value };
                          return { ...modal, teammates };
                        })}
                        style={{ width: 160, borderRadius: 8, border: email && !emailValid ? '1.5px solid #ff0080' : '1.5px solid #00dfd8', padding: '6px 10px', fontWeight: 600, fontSize: 15 }}
                        required
                      />
                      <button
                        onClick={() => setTeammateModal(modal => {
                          const teammates = modal.teammates.filter((_, idx) => idx !== i);
                          return { ...modal, count: modal.count - 1, teammates };
                        })}
                        style={{ background: '#ff0080', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 10px', fontWeight: 700, fontSize: 15, marginLeft: 4, cursor: 'pointer', boxShadow: '0 2px 8px #ff008022' }}
                        title="Remove teammate"
                        disabled={teammateModal.count <= 1}
                      >–</button>
                    </div>
                  );
                })}
                {/* Add/Remove buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <button
                    onClick={() => {
                      const max = teammateModal.activity?.maxTeammates ?? 0;
                      setTeammateModal(modal => ({ ...modal, count: Math.min(max, modal.count + 1), teammates: Array(Math.min(max, modal.count + 1)).fill({ name: '', email: '' }).map((_, i) => modal.teammates[i] || { name: '', email: '' }) }));
                    }}
                    style={{ fontSize: 18, fontWeight: 700, borderRadius: 8, border: 'none', background: '#eee', color: '#007cf0', width: 32, height: 32, cursor: 'pointer' }}
                    disabled={teammateModal.count === (teammateModal.activity?.maxTeammates ?? 0)}
                  >+</button>
                </div>
              </>
            ) : (
              <div style={{ color: '#007cf0', fontWeight: 700, fontSize: 16, marginBottom: 18 }}>No teammates required for this activity.</div>
            )}
            {/* Payment section for paid activities */}
            {Number(teammateModal.activity.fee) > 0 && (
              <div style={{ marginTop: 18, marginBottom: 18, background: 'rgba(255,255,255,0.22)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 700, color: '#007cf0', fontSize: 17, marginBottom: 8 }}>Payment Required</div>
                <div style={{ color: '#232323', fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Fee: ₹{teammateModal.activity.fee}</div>
                {teammateModal.activity.upiId && (
                  <div style={{ color: '#007cf0', fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Pay to UPI ID: <span style={{ fontWeight: 800 }}>{teammateModal.activity.upiId}</span></div>
                )}
                {/* QR code if available */}
                {teammateModal.activity.upiId && (
                  <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=upi://pay?pa=${encodeURIComponent(teammateModal.activity.upiId)}&pn=SmartBookAI&am=${teammateModal.activity.fee}`}
                    alt="UPI QR"
                    width={120}
                    height={120}
                    style={{ borderRadius: 8, background: '#fff' }}
                  />
                )}
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 600, color: '#007cf0', fontSize: 15 }}>Upload Payment Screenshot:</label>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={async (e) => {
                    setUploadError("");
                    if (!e.target.files || e.target.files.length === 0) return;
                    const file = e.target.files[0];
                    const formData = new FormData();
                    formData.append('paymentProof', file);
                    setUploading(true);
                    try {
                      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/upload-proof`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                        body: formData
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.message || 'Upload failed');
                      setPaymentProof(data.url);
                                      } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : "Upload failed";
                    setUploadError(errorMessage);
                      setPaymentProof("");
                    }
                    setUploading(false);
                  }} style={{ marginLeft: 8, marginTop: 4 }} />
                  {uploading && <span style={{ color: '#007cf0', marginLeft: 8 }}>Uploading...</span>}
                  {uploadError && <span style={{ color: '#ff0080', marginLeft: 8 }}>{uploadError}</span>}
                  {paymentProof && <a href={paymentProof} target="_blank" rel="noopener noreferrer" style={{ color: '#00dfd8', marginLeft: 8 }}>View Uploaded Screenshot</a>}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontWeight: 600, color: '#007cf0', fontSize: 15 }}>Transaction ID:</label>
                  <input type="text" value={paymentTxnId} onChange={e => setPaymentTxnId(e.target.value)} style={{ marginLeft: 8, borderRadius: 8, border: '1.5px solid #00dfd8', padding: '6px 10px', fontWeight: 600, fontSize: 15 }} placeholder="Enter UPI Transaction ID" />
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 16, marginTop: 28, justifyContent: 'flex-end' }}>
              <button
                className="primary"
                style={{ fontWeight: 900, fontSize: 18, borderRadius: 12, padding: '10px 32px', background: 'linear-gradient(90deg,#00dfd8,#007cf0)', color: '#fff', boxShadow: '0 2px 8px #00dfd822', border: 'none' }}
                onClick={() => teammateModal.activity && handleBook(
                  teammateModal.activity._id,
                  teammateModal.teammates.slice(0, teammateModal.count),
                  paymentProof,
                  paymentTxnId
                )}
                disabled={
                  bookingId === teammateModal.activity?._id ||
                  teammateModal.teammates.slice(0, teammateModal.count).some(t => !t.name || !t.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t.email)) ||
                  (!!teammateModal.activity.fee && teammateModal.activity.fee > 0 && !paymentProof)
                }
              >
                {bookingId === teammateModal.activity?._id ? 'Booking...' : 'Book Now'}
              </button>
              <button
                style={{ fontWeight: 700, fontSize: 17, borderRadius: 12, padding: '10px 32px', background: '#fff', color: '#007cf0', border: '1.5px solid #00dfd8', boxShadow: '0 2px 8px #00dfd822' }}
                onClick={() => {
                  setTeammateModal({ activity: null, count: 0, teammates: [] });
                  setPaymentProof("");
                  setPaymentTxnId("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 
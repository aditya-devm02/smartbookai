"use client";
import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Image from "next/image";

type Activity = {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  slots: number;
  duration?: number;
  imageUrl?: string;
  maxBookingsPerUser?: number;
  maxTeammates?: number;
  fee?: number;
  upiId?: string;
};

type Booking = {
  _id: string;
  user: { username: string; email: string };
  bookingDate: string;
  paymentStatus?: string;
  paymentProof?: string;
  paymentTxnId?: string;
};

// Define EventType interface
interface EventType {
  name?: string;
  slug?: string;
  category?: string;
  date?: string;
  description?: string;
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    duration: "",
    slots: "",
    imageUrl: "",
    maxBookingsPerUser: 1,
    maxTeammates: 0,
    fee: 0,
    upiId: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    duration: "",
    slots: "",
    imageUrl: "",
    maxBookingsPerUser: 1,
    maxTeammates: 0,
    fee: 0,
    upiId: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [event, setEvent] = useState<EventType | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [bookingsModal, setBookingsModal] = useState<{ activityId: string; title: string } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);

  // Check admin status and get eventId from JWT
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setIsAdmin(payload.role === "admin");
      setEventId(payload.eventId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error parsing token payload:", err.message);
      }
      setIsAdmin(false);
      setEventId(null);
    }
  }, []);

  // Fetch event details
  useEffect(() => {
    if (!eventId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}`)
      .then(res => res.json())
      .then(data => setEvent(data))
      .catch((err: unknown) => {
        if (err instanceof Error) {
          console.error("Error fetching event details:", err.message);
        }
        setEvent(null);
      });
  }, [eventId]);

  // Fetch activities for this event
  const fetchActivities = () => {
    if (!eventId) return;
    setError("");
    setSuccess("");
    setBookings([]); // Clear previous bookings
    setBookingsLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activities?eventId=${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        setActivities(data);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          console.error("Error fetching activities:", err.message);
        }
        setActivities([]);
        setError("Failed to fetch activities.");
      })
      .finally(() => {
        setBookingsLoading(false);
      });
  };
  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line
  }, [success, eventId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm({ ...form, [name]: type === 'number' ? Number(value) : value });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setEditForm({ ...editForm, [name]: type === 'number' ? Number(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");
    if (!token) return setError("Not authenticated");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, duration: form.duration ? Number(form.duration) : undefined, slots: form.slots ? Number(form.slots) : undefined, eventId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add activity");
      }
      setSuccess("Activity added!");
      setForm({ title: "", description: "", category: "", date: "", duration: "", slots: "", imageUrl: "", maxBookingsPerUser: 1, maxTeammates: 0, fee: 0, upiId: "" });
      fetchActivities(); // Refresh activities after adding
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const handleEdit = (activity: Activity) => {
    setEditId(activity._id);
    setEditForm({
      title: activity.title,
      description: activity.description,
      category: activity.category,
      date: activity.date ? new Date(activity.date).toISOString().slice(0, 16) : "",
      slots: activity.slots.toString(),
      duration: activity.duration ? activity.duration.toString() : "",
      imageUrl: activity.imageUrl || "",
      maxBookingsPerUser: activity.maxBookingsPerUser || 1,
      maxTeammates: activity.maxTeammates || 0,
      fee: activity.fee || 0,
      upiId: activity.upiId || "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");
    if (!token || !editId) return setError("Not authenticated");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activities/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...editForm, duration: editForm.duration ? Number(editForm.duration) : undefined, slots: editForm.slots ? Number(editForm.slots) : undefined }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update activity");
      }
      setSuccess("Activity updated!");
      setEditId(null);
      fetchActivities();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");
    if (!token) return setError("Not authenticated");
    if (!window.confirm("Are you sure you want to delete this activity?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activities/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete activity");
      }
      setSuccess("Activity deleted!");
      fetchActivities();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  // Fetch bookings for an activity
  const fetchBookings = async (activityId: string, title: string) => {
    setBookingsModal({ activityId, title });
    setBookingsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activities/${activityId}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Failed to fetch bookings:', {
          status: res.status,
          statusText: res.statusText,
          errorData,
          url: res.url
        });
        setBookings([]);
        setError(errorData.message || `Failed to fetch bookings (${res.status})`);
      } else {
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
        setError("");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error fetching bookings:', err);
        setBookings([]);
        setError(err.message || 'Failed to fetch bookings');
      }
    } finally {
      setBookingsLoading(false);
    }
  };

  // Download bookings as CSV
  const downloadBookings = async (activityId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activities/${activityId}/bookings/export`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Delete a booking
  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    const token = localStorage.getItem("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setBookings(bookings => bookings.filter(b => b._id !== bookingId));
  };

  // Add approve/reject handlers
  const handleApproveBooking = async (bookingId: string) => {
    const token = localStorage.getItem("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    setBookings(bookings => bookings.map(b => b._id === bookingId ? { ...b, paymentStatus: 'approved' } : b));
  };
  const handleRejectBooking = async (bookingId: string) => {
    const token = localStorage.getItem("token");
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    setBookings(bookings => bookings.map(b => b._id === bookingId ? { ...b, paymentStatus: 'rejected' } : b));
  };

  if (!isAdmin) {
    return (
      <>
        {/* <div className={styles.bgAnimated} /> */}
        <NavBar />
        <main style={{ minHeight: '100vh', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ maxWidth: 420, width: '100%', margin: 'auto', textAlign: 'center', padding: 48 }}>
            <h2 className={styles.animatedHeadline} style={{ fontSize: 32, marginBottom: 18 }}>Admin Dashboard</h2>
            <div style={{ color: '#ff0080', fontWeight: 700, fontSize: 20 }}>Not authorized</div>
          </div>
        </main>
      </>
    );
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

  return (
    <>
      {/* <div className={styles.bgAnimated} /> */}
      <NavBar />
      <main style={{ minHeight: '100vh', background: 'none', padding: 0 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 16px' }}>
          {event && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
              {event.branding?.logoUrl && (
                <Image
                  src={event.branding.logoUrl}
                  alt="Event Logo"
                  width={60}
                  height={60}
                  style={{ borderRadius: 12, boxShadow: '0 2px 12px #007cf022' }}
                />
              )}
              <div>
                <div style={{ color: event.branding?.primaryColor || '#00dfd8', fontWeight: 900, fontSize: 32, letterSpacing: 1 }}>{event.name}</div>
                <div style={{ color: event.branding?.secondaryColor || '#ff0080', fontWeight: 700, fontSize: 18 }}>{event.slug}</div>
                {/* Share Registration Link */}
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#00dfd8', fontWeight: 700, fontSize: 15 }}>Share Registration Link:</span>
                  <input
                    type="text"
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/signup?eventSlug=${event.slug}`}
                    readOnly
                    style={{ width: 320, fontSize: 14, padding: '6px 10px', borderRadius: 8, border: '1px solid #00dfd8', background: '#181828', color: '#fff', fontWeight: 600 }}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/signup?eventSlug=${event.slug}`);
                      alert('Registration link copied!');
                    }}
                    style={{ background: 'linear-gradient(90deg,#00dfd8,#007cf0)', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 8, padding: '7px 18px', cursor: 'pointer', fontSize: 14, boxShadow: '0 2px 8px #00dfd822' }}
                  >
                    Copy
                  </button>
                </div>
                {/* QR Code Download */}
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#ff0080', fontWeight: 700, fontSize: 15 }}>QR Code for Registration:</span>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/slug/${event.slug}/qr-code`);
                        if (response.ok) {
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `event-${event.slug}-qr.png`;
                          a.click();
                          window.URL.revokeObjectURL(url);
                        } else {
                          alert('Failed to generate QR code');
                        }
                      } catch (error: unknown) {
                        if (error instanceof Error) {
                          console.error('QR code download error:', error);
                          alert('Failed to download QR code');
                        }
                      }
                    }}
                    style={{ background: 'linear-gradient(90deg,#ff0080,#7928ca)', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 8, padding: '7px 18px', cursor: 'pointer', fontSize: 14, boxShadow: '0 2px 8px #ff008022' }}
                  >
                    📱 Download QR Code
                  </button>
                </div>
              </div>
            </div>
          )}
          <h1 className={styles.animatedHeadline} style={{ fontSize: 38, marginBottom: 32 }}>Admin Dashboard</h1>
          <div className="card" style={{ background: 'rgba(255,255,255,0.13)', borderRadius: 22, boxShadow: '0 4px 32px #007cf022', padding: 36, marginBottom: 40, border: '1.5px solid #3333', animation: 'fadeInAnim 1.2s cubic-bezier(.4,2,.6,1) both' }}>
            <h2 style={{ color: '#00dfd8', fontWeight: 800, fontSize: 26, marginBottom: 18 }}>Create / Edit Activity</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: 32, background: 'var(--card-bg)', borderRadius: 16, boxShadow: '0 2px 8px #0006', padding: 28, border: '2px solid var(--primary)', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required style={{ width: 140 }} />
              <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required style={{ width: 120 }} />
              <input name="date" type="datetime-local" placeholder="Date" value={form.date} onChange={handleChange} required style={{ width: 180 }} />
              <input name="duration" type="number" placeholder="Duration (min)" value={form.duration || ''} onChange={handleChange} style={{ width: 120 }} />
              <input name="slots" type="number" placeholder="Slot" value={form.slots} onChange={handleChange} required style={{ width: 80 }} />
              <input name="imageUrl" placeholder="Image URL" value={form.imageUrl || ''} onChange={handleChange} style={{ width: 180 }} />
              <input name="fee" type="number" min={0} placeholder="Fee (INR)" value={form.fee} onChange={handleChange} style={{ width: 120 }} />
              <input name="upiId" placeholder="UPI ID (e.g. name@upi)" value={form.upiId} onChange={handleChange} style={{ width: 180 }} />
              <label>Max bookings per user:
                <input type="number" name="maxBookingsPerUser" min={1} value={form.maxBookingsPerUser} onChange={handleChange} />
              </label>
              <label>Max teammates per booking:
                <input type="number" name="maxTeammates" min={0} value={form.maxTeammates} onChange={handleChange} />
              </label>
              <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required style={{ width: 220, minHeight: 40 }} />
              <button type="submit" style={{ background: 'var(--primary)', color: '#fff', fontWeight: 900, fontSize: 16, borderRadius: 8, padding: '10px 28px', marginTop: 8 }}>Add</button>
            </form>
            {error && <p style={{ color: 'var(--primary)', background: '#2a0000', borderRadius: 6, padding: 10, marginTop: 8, fontWeight: 700, textAlign: 'center' }}>{error}</p>}
            {success && <p style={{ color: 'var(--accent)', background: '#1a1a00', borderRadius: 6, padding: 10, marginTop: 8, fontWeight: 700, textAlign: 'center' }}>{success}</p>}
            {editId ? (
              <form onSubmit={handleEditSubmit} style={{ marginBottom: 32, background: 'var(--card-bg)', borderRadius: 16, boxShadow: '0 2px 8px #0006', padding: 28, border: '2px solid var(--primary)', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                <input name="title" value={editForm.title} onChange={handleEditChange} required style={{ width: 140 }} />
                <input name="category" value={editForm.category} onChange={handleEditChange} required style={{ width: 120 }} />
                <input name="date" type="datetime-local" value={editForm.date} onChange={handleEditChange} required style={{ width: 180 }} />
                <input name="duration" type="number" value={editForm.duration || ''} onChange={handleEditChange} style={{ width: 120 }} />
                <input name="slots" type="number" placeholder="Slot" value={editForm.slots} onChange={handleEditChange} required style={{ width: 80 }} />
                <input name="imageUrl" placeholder="Image URL" value={editForm.imageUrl || ''} onChange={handleEditChange} style={{ width: 180 }} />
                <input name="fee" type="number" min={0} placeholder="Fee (INR)" value={editForm.fee} onChange={handleEditChange} style={{ width: 120 }} />
                <input name="upiId" placeholder="UPI ID (e.g. name@upi)" value={editForm.upiId} onChange={handleEditChange} style={{ width: 180 }} />
                <label>Max bookings per user:
                  <input type="number" name="maxBookingsPerUser" min={1} value={editForm.maxBookingsPerUser} onChange={handleEditChange} />
                </label>
                <label>Max teammates per booking:
                  <input type="number" name="maxTeammates" min={0} value={editForm.maxTeammates} onChange={handleEditChange} />
                </label>
                <textarea name="description" value={editForm.description} onChange={handleEditChange} required style={{ width: 220, minHeight: 40 }} />
                <button type="submit" style={{ background: 'var(--primary)', color: '#fff', fontWeight: 900, fontSize: 16, borderRadius: 8, padding: '10px 28px', marginTop: 8 }}>Save</button>
                <button type="button" onClick={() => setEditId(null)} style={{ background: '#333', color: '#fff', fontWeight: 700, fontSize: 16, borderRadius: 8, padding: '8px 22px', marginLeft: 8 }}>Cancel</button>
              </form>
            ) : null}
          </div>
          <h2 className={styles.animatedHeadline} style={{ fontSize: 28, marginBottom: 18 }}>All Activities</h2>
          <div style={{ marginTop: 40 }}>
            <h2 style={{ color: '#00dfd8', fontWeight: 800, fontSize: 26, marginBottom: 18 }}>Activities</h2>
            {activities.map((activity) => (
              <div key={activity._id} style={{ background: 'rgba(255,255,255,0.13)', borderRadius: 22, boxShadow: '0 4px 32px #007cf022', padding: 32, marginBottom: 28, border: '1.5px solid #3333', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 22, color: '#00dfd8', marginBottom: 6 }}>{activity.title}</div>
                  <div style={{ color: '#fff', fontSize: 16, marginBottom: 4 }}>{activity.category} &bull; {new Date(activity.date).toLocaleDateString()}</div>
                  <div style={{ color: '#fff', fontSize: 15, marginBottom: 8 }}>Slots: {activity.slots}</div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button style={{ background: 'linear-gradient(90deg,#00dfd8,#007cf0)', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', fontSize: 15, boxShadow: '0 2px 8px #00dfd822' }} onClick={() => fetchBookings(activity._id, activity.title)}>View Bookings</button>
                  <button style={{ background: 'linear-gradient(90deg,#7928ca,#ff0080)', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', fontSize: 15, boxShadow: '0 2px 8px #7928ca22' }} onClick={() => downloadBookings(activity._id)}>Download Bookings</button>
                  <button style={{ background: '#23234a', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', fontSize: 15 }} onClick={() => handleEdit(activity)}>Edit</button>
                  <button style={{ background: '#ff0080', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', fontSize: 15 }} onClick={() => handleDelete(activity._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      {/* Bookings Modal */}
      {bookingsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(24,24,40,0.82)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#23234a', borderRadius: 22, boxShadow: '0 4px 32px #007cf022', padding: 36, minWidth: 380, maxWidth: 700, width: '100%', color: '#fff', border: '1.5px solid #00dfd8', position: 'relative', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ fontWeight: 800, fontSize: 22, color: '#00dfd8', marginBottom: 18 }}>Bookings for: {bookingsModal.title}</div>
            <button style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }} onClick={() => setBookingsModal(null)}>&times;</button>
            {bookingsLoading ? (
              <div style={{ color: '#00dfd8', fontWeight: 700, fontSize: 18 }}>Loading...</div>
            ) : !Array.isArray(bookings) || bookings.length === 0 ? (
              <div style={{ color: '#ff0080', fontWeight: 700, fontSize: 18 }}>No bookings for this activity.</div>
            ) : (
              <div style={{ overflowX: 'auto', maxHeight: '60vh' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10, fontSize: 15 }}>
                  <thead style={{ position: 'sticky', top: 0, background: 'rgba(24,24,40,0.95)', zIndex: 2 }}>
                    <tr style={{ color: '#00dfd8', fontWeight: 700, fontSize: 16 }}>
                      <th style={{ textAlign: 'left', padding: '10px 8px' }}>User</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px' }}>Email</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px' }}>Booking Date</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px' }}>Status</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px' }}>Payment</th>
                      <th style={{ textAlign: 'left', padding: '10px 8px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(bookings) ? bookings : []).map((b, idx) => (
                      <tr key={b._id} style={{ borderBottom: '1px solid #00dfd822', background: idx % 2 === 0 ? 'rgba(0,0,0,0.07)' : 'rgba(0,0,0,0.13)' }}>
                        <td style={{ padding: '10px 8px', fontWeight: 600 }}>{b.user?.username}</td>
                        <td style={{ padding: '10px 8px' }}>{b.user?.email}</td>
                        <td style={{ padding: '10px 8px' }}>{new Date(b.bookingDate).toLocaleString()}</td>
                        <td style={{ padding: '10px 8px', fontWeight: 700, color: b.paymentStatus === 'approved' ? '#00dfd8' : b.paymentStatus === 'rejected' ? '#ff0080' : '#ffd700' }}>{b.paymentStatus || 'N/A'}</td>
                        <td style={{ padding: '10px 8px', minWidth: 120 }}>
                          {b.paymentProof ? (
                            <a href={`${API_URL}${b.paymentProof}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', border: '2px solid #00dfd8', borderRadius: 6, overflow: 'hidden', background: '#fff', marginBottom: 4 }}>
                              <Image
                                src={`${API_URL}${b.paymentProof}`}
                                alt="Payment Screenshot"
                                width={80}
                                height={60}
                                style={{ display: 'block' }}
                              />
                            </a>
                          ) : (
                            <span style={{ color: '#bbb', fontStyle: 'italic' }}>No proof</span>
                          )}
                          {b.paymentTxnId && <div style={{ fontSize: 13, color: '#00dfd8', fontWeight: 600, marginTop: 2 }}>Txn: {b.paymentTxnId}</div>}
                        </td>
                        <td style={{ padding: '10px 8px', minWidth: 120 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {b.paymentStatus === 'pending' && (
                              <>
                                <button style={{ background: '#00dfd8', color: '#181824', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 700, marginBottom: 4, transition: 'background 0.2s' }} onClick={() => handleApproveBooking(b._id)} onMouseOver={e => e.currentTarget.style.background='#00bfae'} onMouseOut={e => e.currentTarget.style.background='#00dfd8'}>Approve</button>
                                <button style={{ background: '#ff0080', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 700, marginBottom: 4, transition: 'background 0.2s' }} onClick={() => handleRejectBooking(b._id)} onMouseOver={e => e.currentTarget.style.background='#c6005a'} onMouseOut={e => e.currentTarget.style.background='#ff0080'}>Reject</button>
                              </>
                            )}
                            <button style={{ background: '#007cf0', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 600, marginBottom: 4, transition: 'background 0.2s' }} onClick={() => setEditBooking(b)} onMouseOver={e => e.currentTarget.style.background='#005bb5'} onMouseOut={e => e.currentTarget.style.background='#007cf0'}>Edit</button>
                            <button style={{ background: '#ff0080', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 600, marginBottom: 4, transition: 'background 0.2s' }} onClick={() => handleDeleteBooking(b._id)} onMouseOver={e => e.currentTarget.style.background='#c6005a'} onMouseOut={e => e.currentTarget.style.background='#ff0080'}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Placeholder for edit booking modal */}
            {editBooking && (
              <div style={{ marginTop: 24, color: '#fff', fontWeight: 700 }}>Edit booking feature coming soon!</div>
            )}
          </div>
        </div>
      )}
    </>
  );
} 
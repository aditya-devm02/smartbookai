"use client";

import NavBar from "./components/NavBar";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Home() {
  useEffect(() => {
    // Animate headline on mount
    const headline = document.querySelector(".hero-headline");
    if (headline) {
      headline.classList.add("pop-in");
    }
  }, []);

  return (
    <>
      <NavBar />
      {/* Animated Gradient Background */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, width: '100vw', height: '100vh',
        zIndex: 0,
        background: 'radial-gradient(ellipse at 60% 20%, #00dfd8 0%, #23234a 60%, #181824 100%)',
        animation: 'bgMove 18s linear infinite alternate',
        filter: 'blur(0px)',
      }} />
      {/* Animated Blobs for fullness */}
      <div style={{
        position: 'fixed',
        top: '-10%', left: '-10%', width: 400, height: 400,
        background: 'radial-gradient(circle at 30% 30%, #00dfd8cc 0%, #007cf000 80%)',
        filter: 'blur(60px)',
        zIndex: 1,
        pointerEvents: 'none',
        animation: 'blobMove1 18s ease-in-out infinite alternate',
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-15%', right: '-10%', width: 500, height: 500,
        background: 'radial-gradient(circle at 70% 70%, #ff0080cc 0%, #7928ca00 80%)',
        filter: 'blur(80px)',
        zIndex: 1,
        pointerEvents: 'none',
        animation: 'blobMove2 22s ease-in-out infinite alternate',
      }} />
      {/* Floating Sparkles */}
      <div className="floating-sparkle" style={{ position: 'fixed', top: '20%', right: '12%', width: 16, height: 16, background: 'rgba(255,255,255,0.7)', borderRadius: '50%', filter: 'blur(2px)', zIndex: 2, animation: 'sparkleFloat 7s linear infinite alternate' }} />
      <div className="floating-sparkle" style={{ position: 'fixed', top: '60%', right: '8%', width: 10, height: 10, background: 'rgba(0,223,216,0.5)', borderRadius: '50%', filter: 'blur(1.5px)', zIndex: 2, animation: 'sparkleFloat2 9s linear infinite alternate' }} />
      <div className="floating-sparkle" style={{ position: 'fixed', top: '35%', right: '18%', width: 8, height: 8, background: 'rgba(255,0,128,0.5)', borderRadius: '50%', filter: 'blur(1.5px)', zIndex: 2, animation: 'sparkleFloat3 11s linear infinite alternate' }} />
      {/* Techy Illustration (SVG) on right side behind How It Works */}
      <div style={{
        position: 'absolute',
        top: '900px',
        right: 0,
        width: 420,
        height: 420,
        zIndex: 1,
        opacity: 0.18,
        pointerEvents: 'none',
        display: 'none',
      }} className="howitworks-illustration">
        <svg width="420" height="420" viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="210" cy="210" r="180" fill="#00dfd8" fillOpacity="0.18" />
          <circle cx="210" cy="210" r="120" fill="#ff0080" fillOpacity="0.13" />
          <rect x="110" y="110" width="200" height="200" rx="40" fill="#007cf0" fillOpacity="0.10" />
          <path d="M210 110 L250 210 L170 210 Z" fill="#ffd700" fillOpacity="0.12" />
        </svg>
      </div>
      <main style={{ padding: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
        {/* Hero Section */}
        <section style={{ width: '100%', padding: '80px 0 40px 0', textAlign: 'center', position: 'relative' }}>
          <h1 className="hero-headline" style={{
            fontSize: 'clamp(2.2rem, 7vw, 4rem)',
            fontWeight: 900,
            letterSpacing: 1.5,
            background: 'linear-gradient(90deg,#00dfd8,#ff0080 60%,#007cf0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 18,
            textShadow: '0 4px 32px #00dfd822',
            transition: 'transform 0.7s cubic-bezier(.4,2,.6,1)',
          }}>
            SmartBookAI
          </h1>
          <p style={{ fontSize: 'clamp(1.1rem, 4vw, 1.7rem)', color: '#fff', fontWeight: 600, maxWidth: 700, margin: '0 auto 32px', lineHeight: 1.5, textShadow: '0 2px 12px #007cf044' }}>
            The <span style={{ color: '#00dfd8' }}>smartest</span> way to manage, discover, and book event activities.<br />
            <span style={{ color: '#ff0080' }}>Multi-tenant</span>, <span style={{ color: '#007cf0' }}>AI-powered</span>, and <span style={{ color: '#ffd700' }}>beautifully simple</span>.
          </p>
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginBottom: 36 }}>
            <a href="/admin-signup" className="primary" style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)', fontWeight: 800, padding: '14px 28px', borderRadius: 16, background: 'linear-gradient(90deg,#00dfd8,#007cf0)', color: '#181824', boxShadow: '0 2px 16px #00dfd822', textDecoration: 'none', letterSpacing: 1, marginBottom: 8 }}>Create Event</a>
            <a href="/signup" className="secondary" style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)', fontWeight: 800, padding: '14px 28px', borderRadius: 16, background: 'linear-gradient(90deg,#ff0080,#7928ca)', color: '#fff', boxShadow: '0 2px 16px #ff008022', textDecoration: 'none', letterSpacing: 1, marginBottom: 8 }}>Join Event</a>
          </div>
          {/* Animated Feature Icons Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18, marginTop: 24 }}>
            <div className="feature-icon" style={{ fontSize: 32, color: '#00dfd8', background: '#23234a', borderRadius: 16, padding: 14, boxShadow: '0 2px 12px #00dfd822', transition: 'transform 0.3s', marginBottom: 8 }}>🤖</div>
            <div className="feature-icon" style={{ fontSize: 32, color: '#ff0080', background: '#23234a', borderRadius: 16, padding: 14, boxShadow: '0 2px 12px #ff008022', transition: 'transform 0.3s', marginBottom: 8 }}>🔒</div>
            <div className="feature-icon" style={{ fontSize: 32, color: '#ffd700', background: '#23234a', borderRadius: 16, padding: 14, boxShadow: '0 2px 12px #ffd70022', transition: 'transform 0.3s', marginBottom: 8 }}>⚡</div>
            <div className="feature-icon" style={{ fontSize: 32, color: '#007cf0', background: '#23234a', borderRadius: 16, padding: 14, boxShadow: '0 2px 12px #007cf022', transition: 'transform 0.3s', marginBottom: 8 }}>📱</div>
            <div className="feature-icon" style={{ fontSize: 32, color: '#00dfd8', background: '#23234a', borderRadius: 16, padding: 14, boxShadow: '0 2px 12px #00dfd822', transition: 'transform 0.3s', marginBottom: 8 }}>💡</div>
          </div>
        </section>
        {/* Features Grid */}
        <section style={{ width: '100%', maxWidth: 1400, margin: '0 auto', padding: '40px 0 0 0' }}>
          <h2 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', fontWeight: 900, marginBottom: 32, textAlign: 'center', letterSpacing: 1 }}>Features That Set Us Apart</h2>
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            <div className="feature-card" style={{ background: '#23234a', borderRadius: 18, padding: 32, boxShadow: '0 2px 16px #00dfd822', border: '2px solid #00dfd8', transition: 'transform 0.3s' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🤖</div>
              <h3 style={{ color: '#00dfd8', fontSize: 22, fontWeight: 800, marginBottom: 10 }}>AI-Powered Recommendations</h3>
              <p style={{ color: '#e0e0e0', fontSize: 16, lineHeight: 1.7 }}>Get personalized activity suggestions based on your interests, history, and event trends.</p>
            </div>
            <div className="feature-card" style={{ background: '#23234a', borderRadius: 18, padding: 32, boxShadow: '0 2px 16px #ff008022', border: '2px solid #ff0080', transition: 'transform 0.3s' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🔒</div>
              <h3 style={{ color: '#ff0080', fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Event Isolation & Security</h3>
              <p style={{ color: '#e0e0e0', fontSize: 16, lineHeight: 1.7 }}>Each event is fully isolated. No cross-event data leaks. Your privacy and data are protected.</p>
            </div>
            <div className="feature-card" style={{ background: '#23234a', borderRadius: 18, padding: 32, boxShadow: '0 2px 16px #ffd70022', border: '2px solid #ffd700', transition: 'transform 0.3s' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>⚡</div>
              <h3 style={{ color: '#ffd700', fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Lightning-Fast Booking</h3>
              <p style={{ color: '#e0e0e0', fontSize: 16, lineHeight: 1.7 }}>Book activities in seconds with a seamless, modern UI and instant feedback.</p>
            </div>
            <div className="feature-card" style={{ background: '#23234a', borderRadius: 18, padding: 32, boxShadow: '0 2px 16px #007cf022', border: '2px solid #007cf0', transition: 'transform 0.3s' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>📱</div>
              <h3 style={{ color: '#007cf0', fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Mobile-First & Responsive</h3>
              <p style={{ color: '#e0e0e0', fontSize: 16, lineHeight: 1.7 }}>Enjoy a beautiful experience on any device. SmartBookAI is fully responsive and touch-friendly.</p>
            </div>
            <div className="feature-card" style={{ background: '#23234a', borderRadius: 18, padding: 32, boxShadow: '0 2px 16px #00dfd822', border: '2px solid #00dfd8', transition: 'transform 0.3s' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>💡</div>
              <h3 style={{ color: '#00dfd8', fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Admin Controls & Analytics</h3>
              <p style={{ color: '#e0e0e0', fontSize: 16, lineHeight: 1.7 }}>Advanced admin dashboard, CSV exports, teammate management, payment verification, and more.</p>
            </div>
            <div className="feature-card" style={{ background: '#23234a', borderRadius: 18, padding: 32, boxShadow: '0 2px 16px #ff008022', border: '2px solid #ff0080', transition: 'transform 0.3s' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🪙</div>
              <h3 style={{ color: '#ff0080', fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Direct UPI Payments</h3>
              <p style={{ color: '#e0e0e0', fontSize: 16, lineHeight: 1.7 }}>Pay directly to organizers via UPI, upload proof, and enjoy secure, manual or automated payment flows.</p>
            </div>
            <div className="feature-card" style={{ background: '#23234a', borderRadius: 18, padding: 32, boxShadow: '0 2px 16px #ffd70022', border: '2px solid #ffd700', transition: 'transform 0.3s' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>👥</div>
              <h3 style={{ color: '#ffd700', fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Teammate & Group Booking</h3>
              <p style={{ color: '#e0e0e0', fontSize: 16, lineHeight: 1.7 }}>Book for yourself or as a team, add teammates, and manage group participation with ease.</p>
            </div>
            <div className="feature-card" style={{ background: '#23234a', borderRadius: 18, padding: 32, boxShadow: '0 2px 16px #007cf022', border: '2px solid #007cf0', transition: 'transform 0.3s' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>📊</div>
              <h3 style={{ color: '#007cf0', fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Real-Time Analytics</h3>
              <p style={{ color: '#e0e0e0', fontSize: 16, lineHeight: 1.7 }}>Track bookings, payments, and event performance in real time with beautiful charts and exports.</p>
            </div>
          </div>
        </section>
        {/* How It Works Timeline */}
        <section style={{ width: '100%', maxWidth: 1100, margin: '80px auto 0', padding: '0 10px' }}>
          <h2 style={{ color: '#fff', fontSize: 'clamp(1.3rem, 4vw, 2.1rem)', fontWeight: 900, marginBottom: 36, textAlign: 'center', letterSpacing: 1 }}>How It Works</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
            {/* Organizer Timeline */}
            <div style={{ flex: 1, minWidth: 240, maxWidth: 480, background: '#181824', borderRadius: 18, padding: 20, boxShadow: '0 2px 16px #00dfd822', border: '2px solid #00dfd8', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: '#00dfd8', fontSize: 22, fontWeight: 800, marginBottom: 18 }}>For Organizers</h3>
              <ol style={{ color: '#e0e0e0', fontSize: 16, lineHeight: 2, paddingLeft: 18, textAlign: 'left', width: '100%', maxWidth: 400 }}>
                <li><b>Create your event</b> with custom branding and details.</li>
                <li><b>Add activities</b> with slots, categories, fees, and UPI IDs.</li>
                <li><b>Share your signup link</b> and QR code with participants.</li>
                <li><b>Monitor bookings</b> and <b>approve payments</b> in your dashboard.</li>
                <li><b>Export data</b> and analyze event performance.</li>
              </ol>
              <a href="/admin-signup" className="primary" style={{ marginTop: 28, fontSize: 18, fontWeight: 800, padding: '14px 32px', borderRadius: 14, background: 'linear-gradient(90deg,#00dfd8,#007cf0)', color: '#181824', boxShadow: '0 2px 16px #00dfd822', textDecoration: 'none', letterSpacing: 1 }}>Create Event</a>
            </div>
            {/* User Timeline */}
            <div style={{ flex: 1, minWidth: 240, maxWidth: 480, background: '#181824', borderRadius: 18, padding: 20, boxShadow: '0 2px 16px #ff008022', border: '2px solid #ff0080', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: '#ff0080', fontSize: 22, fontWeight: 800, marginBottom: 18 }}>For Participants</h3>
              <ol style={{ color: '#e0e0e0', fontSize: 16, lineHeight: 2, paddingLeft: 18, textAlign: 'left', width: '100%', maxWidth: 400 }}>
                <li><b>Register for your event</b> using the unique link or QR code.</li>
                <li><b>Browse activities</b> and get personalized recommendations.</li>
                <li><b>Book your spot</b> and pay securely via UPI.</li>
                <li><b>Upload payment proof</b> and manage your bookings.</li>
                <li><b>Enjoy the event</b> and track your participation.</li>
              </ol>
              <a href="/signup" className="secondary" style={{ marginTop: 28, fontSize: 18, fontWeight: 800, padding: '14px 32px', borderRadius: 14, background: 'linear-gradient(90deg,#ff0080,#7928ca)', color: '#fff', boxShadow: '0 2px 16px #ff008022', textDecoration: 'none', letterSpacing: 1 }}>Join Event</a>
            </div>
          </div>
        </section>
        {/* Testimonial Carousel */}
        <TestimonialCarousel />

        {/* Call to Action */}
        <section style={{ width: '100%', margin: '80px 0 0 0', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(90deg,#00dfd8,#ff0080 60%,#007cf0)',
            borderRadius: 18,
            padding: '32px 48px',
            boxShadow: '0 4px 32px #00dfd822',
            marginBottom: 40
          }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#181824', marginBottom: 18, letterSpacing: 1 }}>Ready to experience the future of event booking?</h2>
            <a href="/admin-signup" className="primary" style={{ fontSize: 22, fontWeight: 900, padding: '18px 48px', borderRadius: 16, background: '#181824', color: '#00dfd8', textDecoration: 'none', letterSpacing: 1, boxShadow: '0 2px 16px #00dfd822' }}>Get Started Now</a>
          </div>
        </section>
      </main>
      {/* Animations */}
      <style>{`
        @keyframes bgMove {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        @keyframes blobMove1 {
          0% { transform: scale(1) translateY(0); }
          100% { transform: scale(1.15) translateY(40px); }
        }
        @keyframes blobMove2 {
          0% { transform: scale(1) translateY(0); }
          100% { transform: scale(1.1) translateY(-30px); }
        }
        @keyframes sparkleFloat {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-40px) scale(1.2); }
        }
        @keyframes sparkleFloat2 {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-30px) scale(1.1); }
        }
        @keyframes sparkleFloat3 {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-20px) scale(1.15); }
        }
        .hero-headline.pop-in {
          transform: scale(1.08) rotate(-2deg);
          animation: popInAnim 1.2s cubic-bezier(.4,2,.6,1) both;
        }
        @keyframes popInAnim {
          0% { opacity: 0; transform: scale(0.7) rotate(-8deg); }
          80% { opacity: 1; transform: scale(1.12) rotate(2deg); }
          100% { opacity: 1; transform: scale(1.08) rotate(-2deg); }
        }
        .feature-icon:hover, .feature-card:hover {
          transform: scale(1.08) translateY(-6px) rotate(-2deg);
          box-shadow: 0 8px 32px #00dfd844;
        }
        .features-grid {
          grid-template-columns: repeat(1, 1fr);
        }
        @media (min-width: 700px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (min-width: 1100px) {
          .features-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
        @media (min-width: 1200px) {
          .howitworks-illustration { display: block !important; }
        }
      `}</style>
    </>
  );
}

function TestimonialCarousel() {
  const testimonials = [
    {
      name: "Aarav Sharma",
      role: "Event Organizer, TechFest",
      text: "SmartBookAI made managing our event a breeze! The AI recommendations boosted our activity participation by 40%.",
      avatar: "https://randomuser.me/api/portraits/men/83.jpg"
    },
    {
      name: "Priya Kapoor",
      role: "Participant",
      text: "Booking was so easy and the suggestions were spot on. Loved the group booking feature!",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg"
    },
    {
      name: "Rahul Mehra",
      role: "Admin, College Fest",
      text: "The payment verification and analytics saved us hours. Our team loved the dashboard!",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg"
    },
    {
      name: "Sneha Tripathi",
      role: "Participant",
      text: "I found new activities I wouldn’t have tried otherwise. The UI is beautiful and so easy to use!",
      avatar: "https://randomuser.me/api/portraits/women/81.jpg"
    }
  ];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [testimonials.length]);
  return (
    <section style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '64px 0 32px 0', position: 'relative', zIndex: 3 }}>
      <div style={{ background: 'rgba(24,24,36,0.92)', borderRadius: 24, boxShadow: '0 4px 32px #00dfd822', padding: '48px 32px', maxWidth: 600, minWidth: 320, textAlign: 'center', position: 'relative', border: '2px solid #00dfd8', transition: 'box-shadow 0.4s' }}>
        <Image
          src={testimonials[index].avatar}
          alt={testimonials[index].name}
          width={64}
          height={64}
          className="rounded-full"
          style={{ border: '3px solid #00dfd8', boxShadow: '0 2px 12px #00dfd822' }}
        />
        <p style={{ color: '#fff', fontSize: 20, fontStyle: 'italic', marginBottom: 18, minHeight: 60, transition: 'opacity 0.5s' }}>
          “{testimonials[index].text}”
        </p>
        <div style={{ color: '#00dfd8', fontWeight: 700, fontSize: 18 }}>{testimonials[index].name}</div>
        <div style={{ color: '#aaa', fontSize: 15, marginBottom: 8 }}>{testimonials[index].role}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
          {testimonials.map((_, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i === index ? '#00dfd8' : '#444', transition: 'background 0.3s' }} />
          ))}
        </div>
      </div>
    </section>
  );
}

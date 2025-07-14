"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NavBar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    setLoggedIn(!!token);
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setIsAdmin(payload.role === "admin");
        // Fetch event info for logo
        if (payload.eventId) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${payload.eventId}`)
            .then(res => res.json())
            .then(() => {
              // The original code had setEvent(data) here, but event is not used in JSX.
              // Keeping the fetch logic as it might be used elsewhere or for future use.
            });
        }
      } catch {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    router.push("/");
  };

  const handleCreateEvent = () => {
    router.push("/admin-signup");
  };

  // Don't render the dynamic content until after hydration
  if (!mounted) {
    return (
      <nav
        style={{
          width: "100%",
          background: "rgba(24,24,40,0.72)",
          backdropFilter: "blur(12px)",
          color: "#fff",
          padding: "0 0 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          boxShadow: "0 2px 24px #007cf022",
          minHeight: 68,
          borderBottom: "1.5px solid #2226",
          transition: "background 0.3s, box-shadow 0.3s",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            fontWeight: 900,
            fontSize: 28,
            color: "#fff",
            letterSpacing: 1.5,
            textDecoration: "none",
            padding: "0 32px",
            background: "linear-gradient(90deg, #00dfd8, #007cf0, #ff0080, #7928ca)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",

            WebkitTextFillColor: "transparent",
            transition: "filter 0.2s",
          }}
          onMouseOver={e => (e.currentTarget.style.filter = "brightness(1.2)")}
          onMouseOut={e => (e.currentTarget.style.filter = "none")}
        >
          {/* <img
            src="/globe.svg"
            alt="SmartBookAI Logo"
            style={{ height: 40, width: "auto", marginRight: 14, borderRadius: 8, background: "rgba(255,255,255,0.04)" }}
          /> */}
          <span style={{ fontWeight: 900, fontSize: 32 }}>SmartBookAI</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 18, paddingRight: 32 }}>
          {/* Create Event Button - Always visible */}
          <button
            onClick={handleCreateEvent}
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              padding: "10px 24px",
              borderRadius: 20,
              background: "linear-gradient(90deg, #00dfd8, #007cf0)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 2px 12px #00dfd822",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 20px #00dfd844";
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 2px 12px #00dfd822";
            }}
          >
            <span style={{ fontSize: 18 }}>✨</span>
            Create Event
          </button>
          
          {/* Help Link - Always visible */}
          <Link
            href="/help"
            style={{
              color: "#fff",
              fontWeight: 600,
              fontSize: 16,
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: 16,
              transition: "background 0.2s, color 0.2s",
              background: "rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            onMouseOver={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
            onMouseOut={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
          >
            <span style={{ fontSize: 16 }}>❓</span>
            Help
          </Link>
          
          {/* Show login/signup buttons during SSR */}
          <>
            <Link
              href="/login"
              className="primary"
              style={{ fontWeight: 700, fontSize: 16, padding: "8px 22px", borderRadius: 18, marginLeft: 8, textDecoration: 'none' }}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="secondary"
              style={{ fontWeight: 700, fontSize: 16, padding: "8px 22px", borderRadius: 18, marginLeft: 8, textDecoration: 'none' }}
            >
              Sign Up
            </Link>
          </>
        </div>
      </nav>
    );
  }

  return (
    <nav
      style={{
        width: "100%",
        background: "rgba(24,24,40,0.72)",
        backdropFilter: "blur(12px)",
        color: "#fff",
        padding: "0 0 0 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 2px 24px #007cf022",
        minHeight: 68,
        borderBottom: "1.5px solid #2226",
        transition: "background 0.3s, box-shadow 0.3s",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          fontWeight: 900,
          fontSize: 28,
          color: "#fff",
          letterSpacing: 1.5,
          textDecoration: "none",
          padding: "0 32px",
          background: "linear-gradient(90deg, #00dfd8, #007cf0, #ff0080, #7928ca)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          transition: "filter 0.2s",
        }}
        onMouseOver={e => (e.currentTarget.style.filter = "brightness(1.2)")}
        onMouseOut={e => (e.currentTarget.style.filter = "none")}
      >
        {/* Removed event logo image here */}
        <span style={{ fontWeight: 900, fontSize: 32 }}>SmartBookAI</span>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 18, paddingRight: 32 }}>
        {/* Create Event Button - Always visible */}
        <button
          onClick={handleCreateEvent}
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            padding: "10px 24px",
            borderRadius: 20,
            background: "linear-gradient(90deg, #00dfd8, #007cf0)",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 2px 12px #00dfd822",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 20px #00dfd844";
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "0 2px 12px #00dfd822";
          }}
        >
          <span style={{ fontSize: 18 }}>✨</span>
          Create Event
        </button>
        
        {/* Help Link - Always visible */}
        <Link
          href="/help"
          style={{
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
            textDecoration: "none",
            padding: "8px 16px",
            borderRadius: 16,
            transition: "background 0.2s, color 0.2s",
            background: "rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
          onMouseOver={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
          onMouseOut={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
        >
          <span style={{ fontSize: 16 }}>❓</span>
          Help
        </Link>
        
        {loggedIn && (
          <>
            <Link
              href="/activities"
              style={{
                color: "#fff",
                fontWeight: 600,
                fontSize: 18,
                textDecoration: "none",
                marginRight: 8,
                padding: "8px 18px",
                borderRadius: 18,
                transition: "background 0.2s, color 0.2s",
                background: "rgba(0,124,240,0.08)",
              }}
              onMouseOver={e => (e.currentTarget.style.background = "#007cf0")}
              onMouseOut={e => (e.currentTarget.style.background = "rgba(0,124,240,0.08)")}
            >
              Activities
            </Link>
            <Link
              href="/profile"
              style={{
                color: "#fff",
                fontWeight: 600,
                fontSize: 18,
                textDecoration: "none",
                marginRight: 8,
                padding: "8px 18px",
                borderRadius: 18,
                transition: "background 0.2s, color 0.2s",
                background: "rgba(121,40,202,0.08)",
              }}
              onMouseOver={e => (e.currentTarget.style.background = "#7928ca")}
              onMouseOut={e => (e.currentTarget.style.background = "rgba(121,40,202,0.08)")}
            >
              Profile
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                style={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 16,
                  padding: "8px 22px",
                  borderRadius: 18,
                  marginLeft: 8,
                  background: "linear-gradient(90deg,#ff0080,#7928ca)",
                  textDecoration: 'none',
                  transition: "background 0.2s, color 0.2s",
                  border: 'none',
                  boxShadow: '0 2px 12px #7928ca22',
                }}
                onMouseOver={e => (e.currentTarget.style.background = "#ff0080")}
                onMouseOut={e => (e.currentTarget.style.background = "linear-gradient(90deg,#ff0080,#7928ca)")}
              >
                Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="secondary"
              style={{ fontWeight: 700, fontSize: 16, padding: "8px 22px", borderRadius: 18, marginLeft: 8 }}
            >
              Logout
            </button>
          </>
        )}
        
        {!loggedIn && (
          <>
            <Link
              href="/login"
              className="primary"
              style={{ fontWeight: 700, fontSize: 16, padding: "8px 22px", borderRadius: 18, marginLeft: 8, textDecoration: 'none' }}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="secondary"
              style={{ fontWeight: 700, fontSize: 16, padding: "8px 22px", borderRadius: 18, marginLeft: 8, textDecoration: 'none' }}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
} 
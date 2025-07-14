"use client";
import React from "react";
import NavBar from "../components/NavBar";

export default function Help() {
  return (
    <>
      <NavBar />
      <main style={{ minHeight: "100vh", background: "var(--background)", color: "var(--foreground)", padding: "40px 0" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", background: "var(--card-bg)", borderRadius: 18, boxShadow: "0 4px 24px #007cf022", padding: 36, border: "2px solid var(--primary)" }}>
          <h1 style={{ color: "var(--primary)", fontWeight: 900, fontSize: 36, marginBottom: 24 }}>Help & FAQ</h1>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ color: "var(--accent)", fontWeight: 700, fontSize: 22 }}>How do I create an account?</h2>
            <p>Click the <b>Sign Up</b> button in the top right and fill in your details. If you have an event code, use your event-specific signup link.</p>
          </div>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ color: "var(--accent)", fontWeight: 700, fontSize: 22 }}>How do I book an activity?</h2>
            <p>Go to the <b>Activities</b> page, browse available activities, and click <b>Book Now</b> on the one you want. Follow the instructions to complete your booking.</p>
          </div>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ color: "var(--accent)", fontWeight: 700, fontSize: 22 }}>Can I add teammates to my booking?</h2>
            <p>Yes! If the activity allows teammates, you can add their details during the booking process.</p>
          </div>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ color: "var(--accent)", fontWeight: 700, fontSize: 22 }}>How do I upload payment proof?</h2>
            <p>For paid activities, you will be prompted to upload a payment screenshot and enter your transaction ID during booking.</p>
          </div>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ color: "var(--accent)", fontWeight: 700, fontSize: 22 }}>Need more help?</h2>
            <p>If you have any issues, please contact your event organizer or email <a href="mailto:support@smartbookai.com" style={{ color: "var(--primary)" }}>support@smartbookai.com</a>.</p>
          </div>
        </div>
      </main>
    </>
  );
} 
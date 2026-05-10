import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/track")({
  head: () => ({ meta: [{ title: "Track Your Order — Survival72™" }] }),
  component: TrackLookup,
});

function TrackLookup() {
  const navigate = useNavigate();
  const [num, setNum] = useState("");
  return (
    <div style={{ maxWidth: 540, margin: "0 auto", padding: "100px 24px", textAlign: "center" }}>
      <span className="s72-kicker" style={{ color: "#C9A96E" }}>Logistics</span>
      <h1 style={{ fontSize: "clamp(28px,3.5vw,40px)", margin: "8px 0 16px" }}>Track Your Order</h1>
      <p style={{ color: "#666", marginBottom: 32 }}>
        Enter your order number to see real-time shipping updates.
      </p>
      <form
        onSubmit={(e) => { e.preventDefault(); if (num.trim()) navigate({ to: "/track/$order", params: { order: num.trim() } }); }}
        style={{ display: "flex", gap: 8, maxWidth: 380, margin: "0 auto" }}
      >
        <input
          value={num}
          onChange={(e) => setNum(e.target.value)}
          placeholder="e.g. S72-10042"
          style={{ flex: 1, padding: "12px 14px", border: "1px solid #ddd", borderRadius: 6, fontSize: 15 }}
        />
        <button type="submit" style={{ padding: "12px 20px", background: "#C9A96E", color: "#111", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>
          Track →
        </button>
      </form>
      <p style={{ marginTop: 32, fontSize: 13 }}>
        <Link to="/account" style={{ color: "#C9A96E" }}>Sign in to see your orders</Link>
      </p>
    </div>
  );
}

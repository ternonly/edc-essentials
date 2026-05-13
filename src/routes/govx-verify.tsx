import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { canonicalTags } from "@/lib/seo";

export const Route = createFileRoute("/govx-verify")({
  head: () => {
    const c = canonicalTags("/govx-verify");
    return {
      meta: [
        { title: "GOVX ID Verification — Survival72™" },
        {
          name: "description",
          content:
            "Verify military, law enforcement, firefighter, or EMS status with GOVX ID and unlock 10% off every order.",
        },
        { property: "og:title", content: "GOVX ID Verification" },
        { property: "og:description", content: "Verify service status to unlock 10% off every Survival72 order." },
        { name: "robots", content: "noindex,follow" },
        ...c.meta,
      ],
      links: c.links,
    };
  },
  component: GovxVerifyPage,
});

const BRANCHES = [
  "Active Military",
  "Veteran",
  "Law Enforcement",
  "Firefighter",
  "EMS / Paramedic",
];

function GovxVerifyPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [lastName, setLastName] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [alreadyVerified, setAlreadyVerified] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("govx_verified")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.govx_verified) {
        setAlreadyVerified(true);
        setVerified(true);
      }
    })();
  }, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setErr(null);
    if (!lastName.trim() || !serviceId.trim() || !agree) {
      setErr("Please complete all fields and accept the consent.");
      return;
    }
    setSubmitting(true);
    // Simulated GOVX ID verification — in production this would call GOVX's API.
    await new Promise((r) => setTimeout(r, 900));
    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        govx_verified: true,
        govx_verified_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    setSubmitting(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setVerified(true);
  }

  if (loading || !user) {
    return <div style={{ padding: 80, textAlign: "center" }}>Loading…</div>;
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px" }}>
      <span className="s72-kicker" style={{ color: "#C9A96E" }}>
        GOVX ID
      </span>
      <h1 className="s72-h1" style={{ marginTop: 8 }}>
        Verify Service Status
      </h1>
      <p style={{ opacity: 0.75, marginBottom: 32 }}>
        Active military, veterans, law enforcement, firefighters, and EMS get
        <strong> 10% off every order </strong>. Verification is handled by GOVX
        ID, an independent service trusted by hundreds of brands.
      </p>

      {verified ? (
        <div
          style={{
            border: "1px solid #C9A96E",
            background: "rgba(201,169,110,0.08)",
            padding: 32,
            borderRadius: 4,
          }}
        >
          <h2 style={{ marginTop: 0, color: "#C9A96E" }}>
            ✓ {alreadyVerified ? "Already Verified" : "Verification Complete"}
          </h2>
          <p>
            Your service status is verified. Use code{" "}
            <code
              style={{
                background: "#1a1a1a",
                padding: "4px 10px",
                borderRadius: 3,
                color: "#C9A96E",
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              GOVX10
            </code>{" "}
            at checkout for 10% off every Survival72™ order.
          </p>
          <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
            <Link to="/shop-the-kit" className="s72-btn s72-btn-primary">
              Shop the Kit
            </Link>
            <Link to="/account" className="s72-btn s72-btn-outline">
              My Account
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, opacity: 0.8 }}>Service category</span>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              style={inputStyle}
            >
              {BRANCHES.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, opacity: 0.8 }}>Last name</span>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={inputStyle}
              autoComplete="family-name"
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, opacity: 0.8 }}>
              Service ID / Badge number
            </span>
            <input
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              fontSize: 13,
              opacity: 0.8,
            }}
          >
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              style={{ marginTop: 4 }}
            />
            <span>
              I consent to GOVX ID verifying my service status. Survival72™
              never sees my documents.
            </span>
          </label>
          {err && <div style={{ color: "#ff6b6b", fontSize: 13 }}>{err}</div>}
          <button
            type="submit"
            disabled={submitting}
            className="s72-btn s72-btn-primary"
            style={{ marginTop: 8 }}
          >
            {submitting ? "Verifying…" : "Verify with GOVX ID"}
          </button>
        </form>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "#0e0e0e",
  border: "1px solid #2a2a2a",
  color: "#fff",
  padding: "12px 14px",
  borderRadius: 3,
  fontSize: 14,
};

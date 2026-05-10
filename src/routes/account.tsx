import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type Order = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  currency: string;
  items: any;
  created_at: string;
};

type Profile = {
  display_name: string | null;
  phone: string | null;
  govx_verified: boolean;
};

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — Survival72™" }] }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("display_name,phone,govx_verified")
        .eq("user_id", user.id)
        .maybeSingle();
      if (p) {
        setProfile(p as Profile);
        setName(p.display_name ?? "");
        setPhone(p.phone ?? "");
      }
      const { data: o } = await supabase
        .from("orders")
        .select("id,order_number,status,total,currency,items,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders((o as Order[]) ?? []);
    })();
  }, [user]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMsg(null);
    const { error } = await supabase.from("profiles").upsert(
      { user_id: user.id, display_name: name, phone },
      { onConflict: "user_id" },
    );
    setSaving(false);
    setMsg(error ? error.message : "Saved.");
  }

  if (loading || !user) return <div style={{ padding: 80, textAlign: "center" }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "60px 24px" }}>
      <span className="s72-kicker" style={{ color: "#C9A96E" }}>My Account</span>
      <h1 style={{ fontSize: "clamp(28px,3.5vw,38px)", margin: "8px 0 32px" }}>
        {profile?.display_name || user.email}
      </h1>

      <section style={card}>
        <h2 style={h2}>Profile</h2>
        <form onSubmit={saveProfile} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
          <label style={lbl}>Display name
            <input value={name} onChange={(e) => setName(e.target.value)} style={inp} />
          </label>
          <label style={lbl}>Phone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inp} placeholder="+971…" />
          </label>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button type="submit" disabled={saving} style={btn}>{saving ? "…" : "Save"}</button>
            {profile?.govx_verified && (
              <span style={{ background: "#0a5", color: "#fff", padding: "4px 10px", borderRadius: 4, fontSize: 12 }}>
                GOVX VERIFIED
              </span>
            )}
          </div>
          {msg && <p style={{ color: msg === "Saved." ? "#0a5" : "#a33", margin: 0 }}>{msg}</p>}
        </form>
      </section>

      <section style={{ ...card, background: profile?.govx_verified ? "#f6f3ec" : "#111", color: profile?.govx_verified ? "#111" : "#fff" }}>
        <h2 style={h2}>GOVX ID — Service Discount</h2>
        {profile?.govx_verified ? (
          <p style={{ margin: 0 }}>
            ✓ Verified. Use code <strong style={{ color: "#C9A96E" }}>GOVX10</strong> at checkout for 10% off every order.
          </p>
        ) : (
          <>
            <p style={{ margin: "0 0 16px", opacity: 0.85 }}>
              Active military, veterans, law enforcement, firefighters, and EMS get 10% off. Verify with GOVX ID in 60 seconds.
            </p>
            <Link to="/govx-verify" style={{ ...btn, background: "#C9A96E", color: "#111", textDecoration: "none", display: "inline-block" }}>
              Verify with GOVX ID →
            </Link>
          </>
        )}
      </section>

      <section style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h2 style={h2}>My Orders</h2>
          <Link to="/track" style={{ color: "#C9A96E", fontSize: 14 }}>Track an order →</Link>
        </div>
        {orders.length === 0 ? (
          <p style={{ color: "#666" }}>No orders yet. <Link to="/shop-the-kit" style={{ color: "#C9A96E" }}>Shop the Kit →</Link></p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ddd", textAlign: "left", color: "#666" }}>
                <th style={th}>Order</th><th style={th}>Date</th><th style={th}>Status</th><th style={th}>Total</th><th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={td}>#{o.order_number}</td>
                  <td style={td}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td style={td}><span style={statusBadge(o.status)}>{o.status}</span></td>
                  <td style={td}>{o.currency} {Number(o.total).toFixed(2)}</td>
                  <td style={td}>
                    <Link to="/track/$order" params={{ order: o.order_number }} style={{ color: "#C9A96E" }}>Track →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <button onClick={() => { signOut(); navigate({ to: "/" }); }} style={{ ...btn, background: "transparent", color: "#a33", border: "1px solid #a33" }}>
        Sign Out
      </button>
    </div>
  );
}

const card: React.CSSProperties = { background: "#fff", padding: 28, borderRadius: 8, marginBottom: 24, border: "1px solid #eee" };
const h2: React.CSSProperties = { fontSize: 18, margin: "0 0 16px", letterSpacing: ".5px" };
const lbl: React.CSSProperties = { display: "grid", gap: 4, fontSize: 13, color: "#666" };
const inp: React.CSSProperties = { padding: "10px 12px", border: "1px solid #ddd", borderRadius: 6, fontSize: 15 };
const btn: React.CSSProperties = { padding: "10px 18px", background: "#111", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer" };
const th: React.CSSProperties = { padding: "10px 8px", fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: ".5px" };
const td: React.CSSProperties = { padding: "12px 8px" };
function statusBadge(s: string): React.CSSProperties {
  const colors: Record<string, string> = { pending: "#888", paid: "#0a5", shipped: "#06c", delivered: "#0a5", cancelled: "#a33" };
  return { background: colors[s] ?? "#888", color: "#fff", padding: "3px 8px", borderRadius: 3, fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" };
}

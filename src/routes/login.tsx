import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — Survival72™" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) navigate({ to: isAdmin ? "/admin" : "/account" });
  }, [user, isAdmin, loading, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        setMsg("注册成功。如已开启邮箱验证请到邮箱激活后再登录。");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      }
    } catch (err: any) {
      setMsg(err.message ?? String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "80px auto", padding: "0 20px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>
        {mode === "signin" ? "Admin Sign In" : "Create Admin Account"}
      </h1>
      <p style={{ color: "#666", marginBottom: 24, fontSize: 14 }}>
        登录后台以管理产品。新账号默认无管理员权限，需要由现有管理员授予；首位用户可直接在数据库授予。
      </p>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={inputStyle}
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6)"
          style={inputStyle}
        />
        <button type="submit" disabled={busy} style={btnStyle}>
          {busy ? "..." : mode === "signin" ? "Sign In" : "Sign Up"}
        </button>
      </form>
      {msg && <p style={{ marginTop: 12, color: "#a33" }}>{msg}</p>}
      <p style={{ marginTop: 16, fontSize: 14 }}>
        {mode === "signin" ? "还没有账号？" : "已有账号？"}{" "}
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          style={{ background: "none", border: "none", color: "#C9A96E", cursor: "pointer", padding: 0 }}
        >
          {mode === "signin" ? "注册" : "登录"}
        </button>
      </p>
      <p style={{ marginTop: 24, fontSize: 13 }}>
        <Link to="/">← 返回首页</Link>
      </p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "12px 14px",
  border: "1px solid #ddd",
  borderRadius: 6,
  fontSize: 15,
};
const btnStyle: React.CSSProperties = {
  padding: "12px 14px",
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontSize: 15,
  cursor: "pointer",
};

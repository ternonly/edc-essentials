import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Survival72™" }] }),
  component: AdminPage,
});

type Product = {
  id: string;
  slug: string;
  module_label: string;
  name: string;
  price: number;
  image_url: string | null;
  specs: [string, string][];
  sort_order: number;
  active: boolean;
};

function AdminPage() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  async function load() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      setMsg(error.message);
      return;
    }
    setProducts((data ?? []) as any);
  }

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  async function uploadImage(p: Product, file: File) {
    setBusy(true);
    setMsg(null);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${p.slug}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      const { error: updErr } = await supabase
        .from("products")
        .update({ image_url: data.publicUrl })
        .eq("id", p.id);
      if (updErr) throw updErr;
      setMsg(`✓ 已替换 ${p.name} 的图片`);
      await load();
    } catch (err: any) {
      setMsg(err.message ?? String(err));
    } finally {
      setBusy(false);
    }
  }

  async function saveField(p: Product, field: keyof Product, value: any) {
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, [field]: value } : x)));
  }

  async function persist(p: Product) {
    setBusy(true);
    setMsg(null);
    const { error } = await supabase
      .from("products")
      .update({
        slug: p.slug,
        module_label: p.module_label,
        name: p.name,
        price: p.price,
        specs: p.specs,
        sort_order: p.sort_order,
        active: p.active,
      })
      .eq("id", p.id);
    setBusy(false);
    setMsg(error ? error.message : `✓ 已保存 ${p.name}`);
  }

  async function remove(p: Product) {
    if (!confirm(`删除 ${p.name}？`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) setMsg(error.message);
    else load();
  }

  async function addNew() {
    const slug = prompt("Slug (英文，唯一)：");
    if (!slug) return;
    const { error } = await supabase.from("products").insert({
      slug,
      module_label: "Module XX",
      name: "New product",
      price: 0,
      specs: [],
      sort_order: products.length + 1,
    });
    if (error) setMsg(error.message);
    else load();
  }

  if (loading) return <div style={{ padding: 40 }}>Loading…</div>;
  if (!user) return null;
  if (!isAdmin)
    return (
      <div style={{ maxWidth: 600, margin: "80px auto", padding: 20 }}>
        <h1>无管理员权限</h1>
        <p>当前账号 <b>{user.email}</b> 没有 admin 角色。</p>
        <p style={{ fontSize: 14, color: "#666", marginTop: 12 }}>
          首次设置：把下面这条 SQL 在 Cloud → Database → SQL Editor 中运行，把当前账号设为管理员：
        </p>
        <pre style={{ background: "#f5f5f5", padding: 12, fontSize: 12, overflow: "auto" }}>
{`insert into public.user_roles (user_id, role)
values ('${user.id}', 'admin');`}
        </pre>
        <button onClick={signOut} style={{ marginTop: 16 }}>Sign out</button>
      </div>
    );

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", padding: "0 20px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, margin: 0 }}>Product Admin</h1>
          <p style={{ color: "#666", fontSize: 13, margin: "4px 0 0" }}>{user.email}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/" style={btnSecondary}>查看前台</Link>
          <button onClick={addNew} style={btnPrimary}>+ 新增产品</button>
          <button onClick={signOut} style={btnSecondary}>Sign out</button>
        </div>
      </header>

      {msg && <div style={{ padding: 10, background: "#f3f1ec", marginBottom: 16, borderRadius: 6 }}>{msg}</div>}

      <div style={{ display: "grid", gap: 20 }}>
        {products.map((p) => (
          <div key={p.id} style={cardStyle}>
            <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 20 }}>
              <div>
                <div style={{ width: 180, height: 180, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 6 }}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: 12, color: "#999" }}>无图片</span>
                  )}
                </div>
                <label style={{ display: "block", marginTop: 8, fontSize: 13 }}>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadImage(p, f);
                    }}
                    disabled={busy}
                  />
                  <span style={{ ...btnSecondary, display: "inline-block", textAlign: "center", width: "100%", cursor: "pointer" }}>
                    {busy ? "上传中…" : "上传 / 替换图片"}
                  </span>
                </label>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <Row label="Slug">
                  <input value={p.slug} onChange={(e) => saveField(p, "slug", e.target.value)} style={inputStyle} />
                </Row>
                <Row label="Module">
                  <input value={p.module_label} onChange={(e) => saveField(p, "module_label", e.target.value)} style={inputStyle} />
                </Row>
                <Row label="Name">
                  <input value={p.name} onChange={(e) => saveField(p, "name", e.target.value)} style={inputStyle} />
                </Row>
                <Row label="Price">
                  <input type="number" step="0.01" value={p.price} onChange={(e) => saveField(p, "price", parseFloat(e.target.value) || 0)} style={inputStyle} />
                </Row>
                <Row label="Sort">
                  <input type="number" value={p.sort_order} onChange={(e) => saveField(p, "sort_order", parseInt(e.target.value) || 0)} style={inputStyle} />
                </Row>
                <Row label="Active">
                  <input type="checkbox" checked={p.active} onChange={(e) => saveField(p, "active", e.target.checked)} />
                </Row>
                <Row label="Specs (JSON)">
                  <textarea
                    rows={6}
                    value={JSON.stringify(p.specs, null, 2)}
                    onChange={(e) => {
                      try {
                        saveField(p, "specs", JSON.parse(e.target.value));
                      } catch {
                        /* ignore until valid */
                      }
                    }}
                    style={{ ...inputStyle, fontFamily: "monospace", fontSize: 12 }}
                  />
                </Row>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button onClick={() => persist(p)} disabled={busy} style={btnPrimary}>保存</button>
                  <button onClick={() => remove(p)} style={{ ...btnSecondary, color: "#c33" }}>删除</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, alignItems: "start" }}>
      <span style={{ fontSize: 13, color: "#555", paddingTop: 8 }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = { padding: "8px 10px", border: "1px solid #ddd", borderRadius: 4, fontSize: 14, width: "100%" };
const btnPrimary: React.CSSProperties = { padding: "8px 14px", background: "#111", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 };
const btnSecondary: React.CSSProperties = { padding: "8px 14px", background: "#fff", color: "#111", border: "1px solid #ddd", borderRadius: 4, cursor: "pointer", fontSize: 13, textDecoration: "none" };
const cardStyle: React.CSSProperties = { background: "#fff", border: "1px solid #eee", padding: 20, borderRadius: 8 };

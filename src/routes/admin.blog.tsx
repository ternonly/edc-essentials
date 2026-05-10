import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { RichEditor } from "@/components/RichEditor";

const CATEGORIES = ["Field Guide", "Kit Reviews", "EDC Philosophy", "Preparedness", "News"];

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_html: string;
  cover_url: string | null;
  category: string;
  tags: string[];
  meta_description: string;
  reading_minutes: number;
  published: boolean;
  published_at: string | null;
  author: string;
};

export const Route = createFileRoute("/admin/blog")({
  head: () => ({ meta: [{ title: "Admin · Blog — Survival72™" }] }),
  component: AdminBlog,
});

function AdminBlog() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { if (!loading && !isAdmin) navigate({ to: "/login" }); }, [isAdmin, loading, navigate]);

  async function load() {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts((data as Post[]) ?? []);
  }
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  function newPost() {
    setEditing({
      id: "", slug: "", title: "", excerpt: "", body_html: "<p>Start writing…</p>",
      cover_url: null, category: "Field Guide", tags: [], meta_description: "",
      reading_minutes: 4, published: false, published_at: null, author: "Survival72 Team",
    });
  }

  async function save() {
    if (!editing) return;
    setBusy(true); setMsg(null);
    const payload: any = { ...editing };
    if (!payload.id) delete payload.id;
    if (payload.published && !payload.published_at) payload.published_at = new Date().toISOString();
    const { error } = editing.id
      ? await supabase.from("blog_posts").update(payload).eq("id", editing.id)
      : await supabase.from("blog_posts").insert(payload);
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    setMsg("Saved.");
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this post?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    load();
  }

  if (loading || !isAdmin) return <div style={{ padding: 80, textAlign: "center" }}>…</div>;

  if (editing) {
    return (
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "40px 24px" }}>
        <button onClick={() => setEditing(null)} style={{ marginBottom: 20, background: "none", border: "none", color: "#C9A96E", cursor: "pointer" }}>← Back to list</button>
        <h1 style={{ fontSize: 26, marginBottom: 24 }}>{editing.id ? "Edit Post" : "New Post"}</h1>

        <div style={{ display: "grid", gap: 16 }}>
          <Field label="Title">
            <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} style={inp} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Slug (URL)">
              <input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value.replace(/[^a-z0-9-]/gi, "-").toLowerCase() })} style={inp} placeholder="my-post-slug" />
            </Field>
            <Field label="Category">
              <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} style={inp}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Cover image URL">
            <input value={editing.cover_url ?? ""} onChange={(e) => setEditing({ ...editing, cover_url: e.target.value || null })} style={inp} />
          </Field>
          <Field label="Excerpt (1–2 sentences)">
            <textarea value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} style={{ ...inp, minHeight: 60 }} />
          </Field>
          <Field label="Meta description (SEO, ~150 chars)">
            <textarea value={editing.meta_description} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} style={{ ...inp, minHeight: 60 }} maxLength={160} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <Field label="Tags (comma-separated)">
              <input
                value={editing.tags.join(", ")}
                onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                style={inp}
              />
            </Field>
            <Field label="Reading minutes">
              <input type="number" min={1} value={editing.reading_minutes} onChange={(e) => setEditing({ ...editing, reading_minutes: +e.target.value || 1 })} style={inp} />
            </Field>
          </div>

          <Field label="Body">
            <RichEditor value={editing.body_html} onChange={(html) => setEditing({ ...editing, body_html: html })} />
          </Field>

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
            <span>Published</span>
          </label>

          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button onClick={save} disabled={busy || !editing.title || !editing.slug} style={btnPrim}>
              {busy ? "Saving…" : "Save"}
            </button>
            <button onClick={() => setEditing(null)} style={btn}>Cancel</button>
          </div>
          {msg && <p style={{ color: msg === "Saved." ? "#0a5" : "#a33" }}>{msg}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Blog Posts</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/admin" style={{ color: "#C9A96E", alignSelf: "center" }}>← Admin</Link>
          <button onClick={newPost} style={btnPrim}>+ New Post</button>
        </div>
      </div>

      {posts.length === 0 ? (
        <p style={{ color: "#666" }}>No posts yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #ddd", textAlign: "left", color: "#666" }}>
              <th style={th}>Title</th><th style={th}>Slug</th><th style={th}>Category</th><th style={th}>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={td}>{p.title}</td>
                <td style={td}><code>{p.slug}</code></td>
                <td style={td}>{p.category}</td>
                <td style={td}>
                  <span style={{ background: p.published ? "#0a5" : "#888", color: "#fff", padding: "2px 8px", borderRadius: 3, fontSize: 11 }}>
                    {p.published ? "PUBLISHED" : "DRAFT"}
                  </span>
                </td>
                <td style={{ ...td, textAlign: "right" }}>
                  <button onClick={() => setEditing(p)} style={{ ...btn, marginRight: 8 }}>Edit</button>
                  <button onClick={() => remove(p.id)} style={{ ...btn, color: "#a33" }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 4 }}>
      <span style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: ".5px" }}>{label}</span>
      {children}
    </label>
  );
}

const inp: React.CSSProperties = { padding: "10px 12px", border: "1px solid #ddd", borderRadius: 6, fontSize: 15, fontFamily: "inherit" };
const btn: React.CSSProperties = { padding: "8px 14px", background: "#fff", border: "1px solid #ddd", borderRadius: 6, fontSize: 14, cursor: "pointer" };
const btnPrim: React.CSSProperties = { padding: "10px 18px", background: "#111", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, cursor: "pointer" };
const th: React.CSSProperties = { padding: "10px 8px", fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: ".5px" };
const td: React.CSSProperties = { padding: "12px 8px" };

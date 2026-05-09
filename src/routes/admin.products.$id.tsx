import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin/products/$id")({
  head: () => ({ meta: [{ title: "Edit product — Admin" }] }),
  component: EditProduct,
});

type Product = {
  id: string;
  slug: string;
  module_label: string;
  name: string;
  price: number;
  image_url: string | null;
  description: string;
  video_url: string | null;
  specs: [string, string][];
  sort_order: number;
  active: boolean;
};

type GalleryImg = { id: string; image_url: string; alt: string; sort_order: number };
type Review = { id: string; author: string; rating: number; title: string; body: string; sort_order: number; active: boolean };

function EditProduct() {
  const { id } = Route.useParams();
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [p, setP] = useState<Product | null>(null);
  const [images, setImages] = useState<GalleryImg[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  async function reload() {
    const [{ data: prod }, { data: imgs }, { data: revs }] = await Promise.all([
      supabase.from("products").select("*").eq("id", id).maybeSingle(),
      supabase.from("product_images").select("*").eq("product_id", id).order("sort_order"),
      supabase.from("product_reviews").select("*").eq("product_id", id).order("sort_order"),
    ]);
    setP(prod as any);
    setImages((imgs ?? []) as any);
    setReviews((revs ?? []) as any);
  }
  useEffect(() => { if (isAdmin) reload(); /* eslint-disable-next-line */ }, [isAdmin, id]);

  if (loading || !p) return <div style={{ padding: 40 }}>Loading…</div>;
  if (!isAdmin) return <div style={{ padding: 40 }}>无权限</div>;

  function update(field: keyof Product, v: any) { setP((prev) => prev ? { ...prev, [field]: v } : prev); }

  async function save() {
    if (!p) return;
    setBusy(true); setMsg(null);
    const { error } = await supabase.from("products").update({
      slug: p.slug, module_label: p.module_label, name: p.name, price: p.price,
      description: p.description, video_url: p.video_url || null, specs: p.specs,
      sort_order: p.sort_order, active: p.active, image_url: p.image_url,
    }).eq("id", p.id);
    setBusy(false);
    setMsg(error ? error.message : "✓ 已保存基本信息");
  }

  async function uploadMain(file: File) {
    setBusy(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${p!.slug}-main-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true, contentType: file.type });
    if (!error) {
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      await supabase.from("products").update({ image_url: data.publicUrl }).eq("id", p!.id);
      update("image_url", data.publicUrl);
    } else setMsg(error.message);
    setBusy(false);
  }

  async function addGalleryImage(file: File) {
    setBusy(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${p!.slug}-gallery-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: true, contentType: file.type });
    if (!upErr) {
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      const { error } = await supabase.from("product_images").insert({
        product_id: p!.id, image_url: data.publicUrl, alt: "", sort_order: images.length,
      });
      if (error) setMsg(error.message);
      await reload();
    } else setMsg(upErr.message);
    setBusy(false);
  }

  async function deleteImg(imgId: string) {
    if (!confirm("删除这张图片？")) return;
    await supabase.from("product_images").delete().eq("id", imgId);
    await reload();
  }

  async function moveImg(imgId: string, dir: -1 | 1) {
    const i = images.findIndex((x) => x.id === imgId); const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const a = images[i], b = images[j];
    await Promise.all([
      supabase.from("product_images").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("product_images").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    await reload();
  }

  async function setImgAlt(imgId: string, alt: string) {
    await supabase.from("product_images").update({ alt }).eq("id", imgId);
    setImages((prev) => prev.map((x) => x.id === imgId ? { ...x, alt } : x));
  }

  async function addReview() {
    const { error } = await supabase.from("product_reviews").insert({
      product_id: p!.id, author: "New buyer", rating: 5, title: "", body: "", sort_order: reviews.length,
    });
    if (error) setMsg(error.message);
    await reload();
  }

  async function saveReview(r: Review) {
    await supabase.from("product_reviews").update({
      author: r.author, rating: r.rating, title: r.title, body: r.body, sort_order: r.sort_order, active: r.active,
    }).eq("id", r.id);
  }

  async function deleteReview(rid: string) {
    if (!confirm("删除这条评论？")) return;
    await supabase.from("product_reviews").delete().eq("id", rid);
    await reload();
  }

  function updateReview(rid: string, field: keyof Review, v: any) {
    setReviews((prev) => prev.map((r) => r.id === rid ? { ...r, [field]: v } : r));
  }

  return (
    <div style={{ maxWidth: 1100, margin: "32px auto", padding: "0 20px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <Link to="/admin" search={{ tab: "products" }} style={{ fontSize: 13, color: "#666" }}>← 回到产品列表</Link>
          <h1 style={{ fontSize: 24, margin: "6px 0 0" }}>{p.name}</h1>
        </div>
        <Link to="/products/$slug" params={{ slug: p.slug }} target="_blank" style={btnSecondary}>查看前台</Link>
      </header>

      {msg && <div style={banner}>{msg}</div>}

      {/* Basic info */}
      <section style={cardStyle}>
        <h2 style={h2}>基本信息</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Slug"><input value={p.slug} onChange={(e) => update("slug", e.target.value)} style={inputStyle} /></Field>
          <Field label="Module label"><input value={p.module_label} onChange={(e) => update("module_label", e.target.value)} style={inputStyle} /></Field>
          <Field label="名称"><input value={p.name} onChange={(e) => update("name", e.target.value)} style={inputStyle} /></Field>
          <Field label="价格"><input type="number" step="0.01" value={p.price} onChange={(e) => update("price", parseFloat(e.target.value) || 0)} style={inputStyle} /></Field>
          <Field label="排序"><input type="number" value={p.sort_order} onChange={(e) => update("sort_order", parseInt(e.target.value) || 0)} style={inputStyle} /></Field>
          <Field label="上架"><label style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="checkbox" checked={p.active} onChange={(e) => update("active", e.target.checked)} /> {p.active ? "上架中" : "已下架"}</label></Field>
        </div>
        <Field label="视频链接（YouTube / Vimeo）"><input value={p.video_url ?? ""} onChange={(e) => update("video_url", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." style={inputStyle} /></Field>
        <Field label="长描述（Markdown）">
          <textarea value={p.description ?? ""} onChange={(e) => update("description", e.target.value)} rows={8} style={{ ...inputStyle, fontFamily: "inherit" }} />
          <small style={{ color: "#888", fontSize: 12 }}>支持 **加粗**、列表、链接等。</small>
        </Field>
        <Field label="规格表（JSON：[[标签, 值], ...]）">
          <textarea
            rows={6}
            defaultValue={JSON.stringify(p.specs, null, 2)}
            onBlur={(e) => { try { update("specs", JSON.parse(e.target.value)); } catch { setMsg("Specs JSON 格式错误"); } }}
            style={{ ...inputStyle, fontFamily: "monospace", fontSize: 12 }}
          />
        </Field>
        <div style={{ marginTop: 12 }}>
          <button onClick={save} disabled={busy} style={btnPrimary}>{busy ? "保存中…" : "保存基本信息"}</button>
        </div>
      </section>

      {/* Main image */}
      <section style={cardStyle}>
        <h2 style={h2}>主图</h2>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 160, height: 160, background: "#f5f5f5", borderRadius: 6, overflow: "hidden" }}>
            {p.image_url && <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
          </div>
          <label style={{ ...btnSecondary, cursor: "pointer" }}>
            {busy ? "上传中…" : "上传 / 替换主图"}
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && uploadMain(e.target.files[0])} />
          </label>
        </div>
      </section>

      {/* Gallery */}
      <section style={cardStyle}>
        <h2 style={h2}>图片库（详情页画廊）</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
          {images.map((img, i) => (
            <div key={img.id} style={{ border: "1px solid #eee", borderRadius: 6, padding: 8, background: "#fafafa" }}>
              <div style={{ aspectRatio: "1/1", background: "#fff", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
                <img src={img.image_url} alt={img.alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <input value={img.alt} onChange={(e) => setImages((prev) => prev.map((x) => x.id === img.id ? { ...x, alt: e.target.value } : x))} onBlur={(e) => setImgAlt(img.id, e.target.value)} placeholder="alt 文本" style={{ ...inputStyle, fontSize: 12, padding: "6px 8px" }} />
              <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                <button onClick={() => moveImg(img.id, -1)} style={miniBtn} disabled={i === 0}>↑</button>
                <button onClick={() => moveImg(img.id, 1)} style={miniBtn} disabled={i === images.length - 1}>↓</button>
                <button onClick={() => deleteImg(img.id)} style={{ ...miniBtn, color: "#c33", marginLeft: "auto" }}>删除</button>
              </div>
            </div>
          ))}
          <label style={{ border: "2px dashed #ddd", borderRadius: 6, padding: 12, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 180, cursor: "pointer", color: "#888", fontSize: 13 }}>
            {busy ? "上传中…" : "+ 添加图片"}
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && addGalleryImage(e.target.files[0])} />
          </label>
        </div>
      </section>

      {/* Reviews */}
      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={h2}>买家评论</h2>
          <button onClick={addReview} style={btnPrimary}>+ 新增评论</button>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {reviews.map((r) => (
            <div key={r.id} style={{ border: "1px solid #eee", borderRadius: 6, padding: 14, background: "#fafafa" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 8, marginBottom: 8 }}>
                <input value={r.author} onChange={(e) => updateReview(r.id, "author", e.target.value)} placeholder="作者" style={inputStyle} />
                <select value={r.rating} onChange={(e) => updateReview(r.id, "rating", parseInt(e.target.value))} style={inputStyle}>
                  {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} 星</option>)}
                </select>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  <input type="checkbox" checked={r.active} onChange={(e) => updateReview(r.id, "active", e.target.checked)} /> 显示
                </label>
                <button onClick={() => deleteReview(r.id)} style={{ ...miniBtn, color: "#c33" }}>删除</button>
              </div>
              <input value={r.title} onChange={(e) => updateReview(r.id, "title", e.target.value)} placeholder="标题（可选）" style={{ ...inputStyle, marginBottom: 6 }} />
              <textarea value={r.body} onChange={(e) => updateReview(r.id, "body", e.target.value)} placeholder="评论内容" rows={3} style={{ ...inputStyle, fontFamily: "inherit" }} />
              <div style={{ marginTop: 6 }}>
                <button onClick={() => saveReview(r)} style={btnSecondary}>保存这条</button>
              </div>
            </div>
          ))}
          {reviews.length === 0 && <p style={{ color: "#888", fontSize: 13 }}>暂无评论。</p>}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6, marginTop: 12 }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: "#444" }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = { padding: "8px 10px", border: "1px solid #ddd", borderRadius: 4, fontSize: 14, width: "100%" };
const btnPrimary: React.CSSProperties = { padding: "8px 14px", background: "#111", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, textDecoration: "none", display: "inline-block" };
const btnSecondary: React.CSSProperties = { padding: "8px 14px", background: "#fff", color: "#111", border: "1px solid #ddd", borderRadius: 4, cursor: "pointer", fontSize: 13, textDecoration: "none", display: "inline-block" };
const miniBtn: React.CSSProperties = { padding: "2px 8px", background: "#fff", border: "1px solid #ddd", borderRadius: 3, cursor: "pointer", fontSize: 11 };
const cardStyle: React.CSSProperties = { background: "#fff", border: "1px solid #eee", padding: 18, borderRadius: 8, marginBottom: 18 };
const h2: React.CSSProperties = { fontSize: 16, margin: "0 0 14px", letterSpacing: 1, textTransform: "uppercase", color: "#666" };
const banner: React.CSSProperties = { padding: 10, background: "#f3f1ec", borderRadius: 6, fontSize: 13, marginBottom: 16 };

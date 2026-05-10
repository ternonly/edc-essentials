import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  CONTENT_SCHEMA,
  PAGE_SLUGS,
  type FieldSpec,
} from "@/lib/admin-schema";

export const Route = createFileRoute("/admin")({
  validateSearch: z.object({
    tab: z.enum(["products", "content", "pages"]).optional(),
  }),
  head: () => ({ meta: [{ title: "Admin — Survival72™" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const tab = search.tab ?? "products";

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  if (loading) return <div style={{ padding: 40 }}>Loading…</div>;
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div style={{ maxWidth: 600, margin: "80px auto", padding: 20 }}>
        <h1>无管理员权限</h1>
        <p>当前账号 <b>{user.email}</b> 没有 admin 角色。</p>
        <p style={{ fontSize: 14, color: "#666", marginTop: 12 }}>
          首次设置：把下面这条 SQL 在 Cloud → Database → SQL Editor 运行：
        </p>
        <pre style={{ background: "#f5f5f5", padding: 12, fontSize: 12, overflow: "auto" }}>
{`insert into public.user_roles (user_id, role)
values ('${user.id}', 'admin');`}
        </pre>
        <button onClick={signOut} style={{ marginTop: 16 }}>Sign out</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "32px auto", padding: "0 20px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, margin: 0 }}>Admin</h1>
          <p style={{ color: "#666", fontSize: 13, margin: "4px 0 0" }}>{user.email}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/admin/blog" style={btnSecondary}>Blog</Link>
          <Link to="/" style={btnSecondary}>查看前台</Link>
          <button onClick={signOut} style={btnSecondary}>Sign out</button>
        </div>
      </header>

      <nav style={{ display: "flex", gap: 4, borderBottom: "1px solid #eee", marginBottom: 24 }}>
        {[
          ["products", "产品"],
          ["content", "首页 / 站点"],
          ["pages", "静态页面"],
        ].map(([k, label]) => (
          <Link
            key={k}
            to="/admin"
            search={{ tab: k as any }}
            style={{
              padding: "10px 18px",
              borderBottom: tab === k ? "2px solid #1A1A1A" : "2px solid transparent",
              color: tab === k ? "#111" : "#666",
              fontSize: 14,
              textDecoration: "none",
              fontWeight: tab === k ? 600 : 400,
            }}
          >
            {label}
          </Link>
        ))}
      </nav>

      {tab === "products" && <ProductsTab />}
      {tab === "content" && <ContentTab />}
      {tab === "pages" && <PagesTab />}
    </div>
  );
}

/* ---------- Products tab ---------- */
function ProductsTab() {
  const [rows, setRows] = useState<any[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from("products")
      .select("id,slug,name,module_label,price,image_url,active,sort_order")
      .order("sort_order");
    if (error) setMsg(error.message);
    else setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function addNew() {
    const slug = prompt("Slug (英文，唯一)：");
    if (!slug) return;
    const { error } = await supabase.from("products").insert({
      slug, module_label: "Module XX", name: "New product", price: 0, specs: [], sort_order: rows.length + 1,
    });
    if (error) setMsg(error.message); else load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button onClick={addNew} style={btnPrimary}>+ 新增产品</button>
      </div>
      {msg && <div style={banner}>{msg}</div>}
      <div style={{ display: "grid", gap: 12 }}>
        {rows.map((p) => (
          <div key={p.id} style={{ ...cardStyle, display: "grid", gridTemplateColumns: "80px 1fr auto", gap: 16, alignItems: "center" }}>
            <div style={{ width: 80, height: 80, background: "#f5f5f5", borderRadius: 6, overflow: "hidden" }}>
              {p.image_url && <img src={p.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#888" }}>{p.module_label} · {p.slug}</div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{p.name}</div>
              <div style={{ fontSize: 13, color: "#666" }}>${Number(p.price).toFixed(2)} · {p.active ? "上架" : "下架"}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link to="/products/$slug" params={{ slug: p.slug }} style={btnSecondary} target="_blank">前台</Link>
              <Link to="/admin/products/$id" params={{ id: p.id }} style={btnPrimary}>编辑详情</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Content tab ---------- */
function ContentTab() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      {CONTENT_SCHEMA.map((group) => (
        <ContentGroupEditor key={group.group + group.key} group={group} />
      ))}
    </div>
  );
}

function ContentGroupEditor({ group }: { group: typeof CONTENT_SCHEMA[number] }) {
  const [value, setValue] = useState<any>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase
      .from("site_content")
      .select("value")
      .eq("group_key", group.group)
      .eq("item_key", group.key)
      .maybeSingle();
    setValue({ ...group.defaults, ...((data?.value as any) ?? {}) });
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function save() {
    setBusy(true); setMsg(null);
    const { error } = await supabase
      .from("site_content")
      .upsert(
        { group_key: group.group, item_key: group.key, value },
        { onConflict: "group_key,item_key" },
      );
    setBusy(false);
    setMsg(error ? error.message : "✓ 已保存");
  }

  async function reset() {
    if (!confirm("恢复默认值（删除自定义内容）？")) return;
    await supabase.from("site_content").delete().eq("group_key", group.group).eq("item_key", group.key);
    await load();
  }

  return (
    <section style={cardStyle}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 17 }}>{group.label}</h3>
          {group.hint && <p style={{ margin: "4px 0 0", color: "#888", fontSize: 12 }}>{group.hint}</p>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={reset} style={btnSecondary}>恢复默认</button>
          <button onClick={save} disabled={busy} style={btnPrimary}>{busy ? "保存中…" : "保存"}</button>
        </div>
      </header>
      <div style={{ display: "grid", gap: 14 }}>
        {group.fields.map((f) => (
          <FieldEditor
            key={f.key}
            spec={f}
            value={value?.[f.key] ?? defaultForField(f)}
            onChange={(v) => setValue((prev: any) => ({ ...prev, [f.key]: v }))}
          />
        ))}
      </div>
      {msg && <div style={{ ...banner, marginTop: 12 }}>{msg}</div>}
    </section>
  );
}

function defaultForField(f: FieldSpec): any {
  if (f.type === "list") return [];
  if (f.type === "image") return "";
  return "";
}

function FieldEditor({ spec, value, onChange }: { spec: FieldSpec; value: any; onChange: (v: any) => void }) {
  if (spec.type === "text") {
    return (
      <Row label={spec.label}>
        <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
      </Row>
    );
  }
  if (spec.type === "textarea") {
    return (
      <Row label={spec.label}>
        <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={4} style={{ ...inputStyle, fontFamily: "inherit" }} />
        {spec.hint && <small style={{ color: "#888", fontSize: 12 }}>{spec.hint}</small>}
      </Row>
    );
  }
  if (spec.type === "image") {
    return (
      <Row label={spec.label}>
        <ImageField value={value ?? ""} onChange={onChange} />
      </Row>
    );
  }
  if (spec.type === "list") {
    return (
      <Row label={spec.label}>
        <ListEditor value={Array.isArray(value) ? value : []} itemFields={spec.itemFields ?? null} onChange={onChange} />
      </Row>
    );
  }
  return null;
}

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  async function upload(file: File) {
    setBusy(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `site/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true, contentType: file.type });
    if (!error) {
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      onChange(data.publicUrl);
    }
    setBusy(false);
  }
  return (
    <div>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://..." style={inputStyle} />
      <div style={{ display: "flex", gap: 12, marginTop: 8, alignItems: "center" }}>
        {value && <img src={value} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4, background: "#f5f5f5" }} />}
        <label style={{ ...btnSecondary, cursor: "pointer", display: "inline-block" }}>
          {busy ? "上传中…" : "上传新图"}
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
        {value && <button onClick={() => onChange("")} style={{ ...btnSecondary, color: "#c33" }}>清除</button>}
      </div>
    </div>
  );
}

function ListEditor({ value, itemFields, onChange }: { value: any[]; itemFields: FieldSpec[] | null; onChange: (v: any[]) => void }) {
  function add() {
    if (!itemFields) onChange([...value, ""]);
    else onChange([...value, Object.fromEntries(itemFields.map((f) => [f.key, defaultForField(f)]))]);
  }
  function update(i: number, v: any) { const copy = [...value]; copy[i] = v; onChange(copy); }
  function remove(i: number) { onChange(value.filter((_, idx) => idx !== i)); }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir; if (j < 0 || j >= value.length) return;
    const copy = [...value]; [copy[i], copy[j]] = [copy[j], copy[i]]; onChange(copy);
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {value.map((item, i) => (
        <div key={i} style={{ border: "1px solid #eee", padding: 12, borderRadius: 6, background: "#fafafa" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <small style={{ color: "#888" }}># {i + 1}</small>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => move(i, -1)} style={miniBtn}>↑</button>
              <button onClick={() => move(i, 1)} style={miniBtn}>↓</button>
              <button onClick={() => remove(i)} style={{ ...miniBtn, color: "#c33" }}>删除</button>
            </div>
          </div>
          {itemFields ? (
            <div style={{ display: "grid", gap: 8 }}>
              {itemFields.map((f) => (
                <FieldEditor key={f.key} spec={f} value={item?.[f.key]} onChange={(v) => update(i, { ...item, [f.key]: v })} />
              ))}
            </div>
          ) : (
            <input value={item ?? ""} onChange={(e) => update(i, e.target.value)} style={inputStyle} />
          )}
        </div>
      ))}
      <button onClick={add} style={{ ...btnSecondary, alignSelf: "flex-start" }}>+ 新增一项</button>
    </div>
  );
}

/* ---------- Pages tab ---------- */
function PagesTab() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      {PAGE_SLUGS.map((p) => (
        <ContentGroupEditor key={p.slug} group={{
          group: "page",
          key: p.slug,
          label: p.label,
          hint: `URL: /${p.slug}`,
          defaults: p.defaults,
          fields: [
            { key: "kicker", type: "text", label: "Kicker（小标题）" },
            { key: "title", type: "text", label: "标题" },
            { key: "intro", type: "textarea", label: "导语" },
            { key: "body_md", type: "textarea", label: "正文（Markdown）", hint: "支持 **加粗**、列表、链接等。" },
          ],
        }} />
      ))}
    </div>
  );
}

/* ---------- shared ---------- */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 13, color: "#444", fontWeight: 500 }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = { padding: "8px 10px", border: "1px solid #ddd", borderRadius: 4, fontSize: 14, width: "100%" };
const btnPrimary: React.CSSProperties = { padding: "8px 14px", background: "#111", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, textDecoration: "none", display: "inline-block" };
const btnSecondary: React.CSSProperties = { padding: "8px 14px", background: "#fff", color: "#111", border: "1px solid #ddd", borderRadius: 4, cursor: "pointer", fontSize: 13, textDecoration: "none", display: "inline-block" };
const miniBtn: React.CSSProperties = { padding: "2px 8px", background: "#fff", border: "1px solid #ddd", borderRadius: 3, cursor: "pointer", fontSize: 11 };
const cardStyle: React.CSSProperties = { background: "#fff", border: "1px solid #eee", padding: 18, borderRadius: 8 };
const banner: React.CSSProperties = { padding: 10, background: "#f3f1ec", borderRadius: 6, fontSize: 13 };

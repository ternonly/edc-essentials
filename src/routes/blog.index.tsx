import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { canonicalTags } from "@/lib/seo";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_url: string | null;
  category: string;
  reading_minutes: number;
  published_at: string | null;
};

export const Route = createFileRoute("/blog/")({
  head: () => {
    const c = canonicalTags("/blog");
    return {
      meta: [
        { title: "Field Guide — Survival72™ Blog" },
        { name: "description", content: "EDC field guides, kit reviews, and practical 72-hour preparedness from the Survival72 team." },
        { property: "og:title", content: "Survival72 Field Guide" },
        { property: "og:description", content: "EDC field guides and 72-hour preparedness know-how." },
        ...c.meta,
      ],
      links: c.links,
    };
  },
  component: BlogIndex,
});

function BlogIndex() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cat, setCat] = useState<string>("All");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id,slug,title,excerpt,cover_url,category,reading_minutes,published_at")
        .eq("published", true)
        .order("published_at", { ascending: false });
      setPosts((data as Post[]) ?? []);
    })();
  }, []);

  const cats = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];
  const filtered = cat === "All" ? posts : posts.filter((p) => p.category === cat);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>
      <span className="s72-kicker" style={{ color: "#C9A96E" }}>Field Guide</span>
      <h1 style={{ fontSize: "clamp(32px,4vw,48px)", margin: "8px 0 12px", letterSpacing: "-.5px" }}>The Survival72 Blog</h1>
      <p style={{ color: "#666", maxWidth: 620, marginBottom: 32 }}>
        Practical, field-tested know-how for the 72 hours that matter — kit reviews, EDC philosophy, and preparedness essentials.
      </p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            style={{
              padding: "6px 14px",
              border: "1px solid " + (c === cat ? "#111" : "#ddd"),
              background: c === cat ? "#111" : "transparent",
              color: c === cat ? "#fff" : "#111",
              borderRadius: 999,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: "#666" }}>No articles yet. Check back soon.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 28 }}>
          {filtered.map((p) => (
            <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} style={{ color: "inherit", textDecoration: "none" }}>
              <article style={{ display: "grid", gap: 12 }}>
                <div style={{
                  aspectRatio: "16/10",
                  background: p.cover_url ? `url(${p.cover_url}) center/cover` : "#f0eee8",
                  borderRadius: 6,
                }} />
                <div style={{ fontSize: 11, letterSpacing: ".8px", textTransform: "uppercase", color: "#C9A96E" }}>
                  {p.category} · {p.reading_minutes} min
                </div>
                <h2 style={{ fontSize: 20, margin: 0, lineHeight: 1.3 }}>{p.title}</h2>
                <p style={{ color: "#666", fontSize: 14, margin: 0 }}>{p.excerpt}</p>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

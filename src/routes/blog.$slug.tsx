import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  published_at: string | null;
  author: string;
};

export const Route = createFileRoute("/blog/$slug")({
  head: ({ loaderData }) => {
    const p = loaderData as Post | null;
    if (!p) return { meta: [{ title: "Article — Survival72™" }] };
    return {
      meta: [
        { title: `${p.title} — Survival72™` },
        { name: "description", content: p.meta_description || p.excerpt },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.meta_description || p.excerpt },
        { property: "og:type", content: "article" },
        ...(p.cover_url ? [{ property: "og:image", content: p.cover_url }, { name: "twitter:image", content: p.cover_url }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/blog/${p.slug}` }],
    };
  },
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", params.slug)
      .eq("published", true)
      .maybeSingle();
    if (!data) throw notFound();
    return data as Post;
  },
  notFoundComponent: () => (
    <div style={{ padding: "100px 24px", textAlign: "center" }}>
      <h1>Article not found</h1>
      <Link to="/blog" style={{ color: "#C9A96E" }}>← Back to blog</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div style={{ padding: "100px 24px", textAlign: "center" }}>
      <h1>Something went wrong</h1>
      <p style={{ color: "#666" }}>{error.message}</p>
    </div>
  ),
  component: BlogPost,
});

function BlogPost() {
  const p = Route.useLoaderData();
  const [related, setRelated] = useState<Pick<Post, "id" | "slug" | "title" | "cover_url">[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id,slug,title,cover_url")
        .eq("published", true)
        .eq("category", p.category)
        .neq("id", p.id)
        .limit(3);
      setRelated(data ?? []);
    })();
  }, [p.id, p.category]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    description: p.meta_description || p.excerpt,
    image: p.cover_url || undefined,
    datePublished: p.published_at,
    author: { "@type": "Organization", name: p.author },
    publisher: { "@type": "Organization", name: "Survival72" },
  };

  return (
    <article style={{ maxWidth: 760, margin: "0 auto", padding: "60px 24px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link to="/blog" style={{ color: "#C9A96E", fontSize: 13 }}>← Field Guide</Link>
      <div style={{ fontSize: 11, letterSpacing: ".8px", textTransform: "uppercase", color: "#C9A96E", marginTop: 24 }}>
        {p.category} · {p.reading_minutes} min read
      </div>
      <h1 style={{ fontSize: "clamp(30px,4.5vw,48px)", margin: "10px 0 16px", lineHeight: 1.15, letterSpacing: "-.5px" }}>
        {p.title}
      </h1>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 32 }}>
        By {p.author} · {p.published_at ? new Date(p.published_at).toLocaleDateString() : ""}
      </p>
      {p.cover_url && (
        <img
          src={p.cover_url}
          alt={p.title}
          loading="eager"
          style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: 6, marginBottom: 32 }}
        />
      )}
      <div
        className="s72-prose"
        style={{ fontSize: 17, lineHeight: 1.75, color: "#222" }}
        dangerouslySetInnerHTML={{ __html: p.body_html }}
      />
      {p.tags.length > 0 && (
        <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {p.tags.map((t) => (
            <span key={t} style={{ background: "#f4f1ea", color: "#666", padding: "4px 10px", borderRadius: 999, fontSize: 12 }}>
              #{t}
            </span>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <section style={{ marginTop: 60, paddingTop: 40, borderTop: "1px solid #eee" }}>
          <h2 style={{ fontSize: 18, marginBottom: 20 }}>Related reads</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 20 }}>
            {related.map((r) => (
              <Link key={r.id} to="/blog/$slug" params={{ slug: r.slug }} style={{ color: "inherit", textDecoration: "none" }}>
                <div style={{ aspectRatio: "16/10", background: r.cover_url ? `url(${r.cover_url}) center/cover` : "#f0eee8", borderRadius: 4, marginBottom: 8 }} />
                <div style={{ fontSize: 14, lineHeight: 1.4 }}>{r.title}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

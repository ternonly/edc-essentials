import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/products/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Survival72™` },
      { name: "description", content: "Survival72 product details, gallery, specs, video and reviews." },
    ],
  }),
  component: ProductDetail,
  notFoundComponent: () => (
    <div style={{ maxWidth: 720, margin: "120px auto", padding: 24, textAlign: "center" }}>
      <h1>Product not found</h1>
      <p style={{ marginTop: 12 }}>
        <Link to="/shop-the-kit" className="s72-btn">Back to Shop</Link>
      </p>
    </div>
  ),
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
};

type GalleryImg = { id: string; image_url: string; alt: string; sort_order: number };
type Review = { id: string; author: string; rating: number; title: string; body: string };

function youtubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      return `https://player.vimeo.com/video/${u.pathname.slice(1)}`;
    }
  } catch {}
  return null;
}

function ProductDetail() {
  const { slug } = Route.useParams();
  const { isAdmin } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<GalleryImg[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function go() {
      const { data: p } = await supabase
        .from("products")
        .select("id,slug,module_label,name,price,image_url,description,video_url,specs")
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle();
      if (cancelled) return;
      if (!p) {
        setLoading(false);
        setProduct(null);
        return;
      }
      setProduct(p as any);
      const [{ data: imgs }, { data: revs }] = await Promise.all([
        supabase.from("product_images").select("id,image_url,alt,sort_order").eq("product_id", p.id).order("sort_order"),
        supabase.from("product_reviews").select("id,author,rating,title,body").eq("product_id", p.id).eq("active", true).order("sort_order"),
      ]);
      if (cancelled) return;
      setImages((imgs ?? []) as any);
      setReviews((revs ?? []) as any);
      setLoading(false);
    }
    go();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return <div style={{ padding: 80, textAlign: "center", color: "#888" }}>Loading…</div>;
  }
  if (!product) throw notFound();

  const allImages = [
    ...(product.image_url ? [{ id: "main", image_url: product.image_url, alt: product.name, sort_order: -1 }] : []),
    ...images,
  ];
  const current = allImages[active] ?? allImages[0];
  const embed = product.video_url ? youtubeEmbed(product.video_url) : null;

  async function handleAdminUpload(files: FileList) {
    if (!product) return;
    setUploading(true);
    setUploadMsg(null);
    let order = images.length;
    let added = 0;
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${product.slug}-media-${Date.now()}-${order}.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) { setUploadMsg(upErr.message); continue; }
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      const { data: row, error } = await supabase.from("product_images").insert({
        product_id: product.id, image_url: data.publicUrl, alt: "", sort_order: order++,
      }).select("id,image_url,alt,sort_order").single();
      if (error) { setUploadMsg(error.message); continue; }
      if (row) setImages((prev) => [...prev, row as any]);
      added++;
    }
    setUploading(false);
    if (added > 0) setUploadMsg(`✓ 已上传 ${added} 个文件`);
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)", gap: 48 }} className="pdp-grid">
        <div>
          <div style={{ background: "#F9F8F6", borderRadius: 8, overflow: "hidden", aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {current ? (
              /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(current.image_url) ? (
                <video src={current.image_url} controls style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }} />
              ) : (
                <img src={current.image_url} alt={current.alt || product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )
            ) : (
              <span style={{ color: "#bbb" }}>No image</span>
            )}
          </div>
          {allImages.length > 1 && (
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              {allImages.map((img, i) => {
                const video = /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(img.image_url);
                return (
                  <button
                    key={img.id}
                    onClick={() => setActive(i)}
                    style={{
                      width: 76,
                      height: 76,
                      border: i === active ? "2px solid #C9A96E" : "2px solid transparent",
                      borderRadius: 6,
                      overflow: "hidden",
                      background: "#000",
                      cursor: "pointer",
                      padding: 0,
                      position: "relative",
                    }}
                    aria-label={`View media ${i + 1}`}
                  >
                    {video ? (
                      <>
                        <video src={img.image_url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, textShadow: "0 1px 4px rgba(0,0,0,0.6)", pointerEvents: "none" }}>▶</span>
                      </>
                    ) : (
                      <img src={img.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <div style={{ color: "#C9A96E", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
            {product.module_label}
          </div>
          <h1 style={{ fontSize: "clamp(28px, 3.4vw, 40px)", margin: "0 0 12px" }}>{product.name}</h1>
          <div style={{ fontSize: 28, fontWeight: 600, color: "#1A1A1A", margin: "8px 0 24px" }}>
            ${Number(product.price).toFixed(2)}
          </div>
          {product.description && (
            <div className="s72-prose" style={{ color: "#333", fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{product.description}</ReactMarkdown>
            </div>
          )}
          <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
            <Link to="/shop-the-kit" className="s72-btn">Configure & Add to Cart</Link>
            <Link to="/shop-the-kit" className="s72-btn s72-btn--outline">Back to Kit</Link>
          </div>
          {Array.isArray(product.specs) && product.specs.length > 0 && (
            <div style={{ borderTop: "1px solid #eee", paddingTop: 20 }}>
              <h3 style={{ fontSize: 14, letterSpacing: 2, textTransform: "uppercase", color: "#666", margin: "0 0 12px" }}>
                Specifications
              </h3>
              <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
                <tbody>
                  {product.specs.map(([k, v], i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f1f1" }}>
                      <td style={{ padding: "8px 0", color: "#666", width: "40%" }}>{k}</td>
                      <td style={{ padding: "8px 0", color: "#1A1A1A" }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {embed && (
        <section style={{ marginTop: 80 }}>
          <h2 style={{ fontSize: 24, marginBottom: 18 }}>In Action</h2>
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: 8 }}>
            <iframe
              src={embed}
              title={product.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
            />
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section style={{ marginTop: 80 }}>
          <h2 style={{ fontSize: 24, marginBottom: 24 }}>What buyers say</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {reviews.map((r) => (
              <article key={r.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 20, background: "#fff" }}>
                <div style={{ color: "#C9A96E", letterSpacing: 2, marginBottom: 8 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                {r.title && <h3 style={{ fontSize: 16, margin: "0 0 8px" }}>{r.title}</h3>}
                <p style={{ color: "#444", lineHeight: 1.7, fontSize: 14 }}>{r.body}</p>
                <div style={{ marginTop: 12, fontWeight: 600, fontSize: 13 }}>— {r.author}</div>
              </article>
            ))}
          </div>
        </section>
      )}

      <style>{`@media (max-width: 768px){ .pdp-grid{ grid-template-columns: 1fr !important; gap: 32px !important; } }`}</style>
    </div>
  );
}

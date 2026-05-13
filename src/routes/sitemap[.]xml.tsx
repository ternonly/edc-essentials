import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SITE = "https://survival72hour.com";

const STATIC_ROUTES: { path: string; changefreq: string; priority: number }[] = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/shop-the-kit", changefreq: "weekly", priority: 0.9 },
  { path: "/about", changefreq: "monthly", priority: 0.7 },
  { path: "/blog", changefreq: "weekly", priority: 0.8 },
  { path: "/wholesale", changefreq: "monthly", priority: 0.7 },
  { path: "/corporate-partnerships", changefreq: "monthly", priority: 0.6 },
  { path: "/contact", changefreq: "yearly", priority: 0.5 },
  { path: "/our-promise", changefreq: "yearly", priority: 0.5 },
  { path: "/military-discount", changefreq: "yearly", priority: 0.5 },
  { path: "/govx-verify", changefreq: "yearly", priority: 0.4 },
  { path: "/products/gift-box", changefreq: "monthly", priority: 0.7 },
  { path: "/warranty", changefreq: "yearly", priority: 0.4 },
  { path: "/return-policy", changefreq: "yearly", priority: 0.3 },
  { path: "/shipping-policy", changefreq: "yearly", priority: 0.3 },
  { path: "/privacy-policy", changefreq: "yearly", priority: 0.3 },
  { path: "/terms-of-service", changefreq: "yearly", priority: 0.3 },
  { path: "/cancellation-policy", changefreq: "yearly", priority: 0.3 },
];

function urlEntry(loc: string, lastmod: string | undefined, changefreq: string, priority: number) {
  const lm = lastmod ? `<lastmod>${new Date(lastmod).toISOString().split("T")[0]}</lastmod>` : "";
  // Add hreflang alternates for en + ar
  const alt = `
    <xhtml:link rel="alternate" hreflang="en" href="${loc}"/>
    <xhtml:link rel="alternate" hreflang="ar" href="${loc}?lng=ar"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}"/>`;
  return `  <url>
    <loc>${loc}</loc>${lm}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>${alt}
  </url>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: string[] = [];

        for (const r of STATIC_ROUTES) {
          entries.push(urlEntry(`${SITE}${r.path}`, undefined, r.changefreq, r.priority));
        }

        try {
          const { data: posts } = await supabaseAdmin
            .from("blog_posts")
            .select("slug, published_at")
            .eq("published", true);
          (posts ?? []).forEach((p: { slug: string; published_at: string | null }) => {
            entries.push(
              urlEntry(`${SITE}/blog/${p.slug}`, p.published_at ?? undefined, "monthly", 0.6),
            );
          });
        } catch {
          // ignore — sitemap should still serve static routes
        }

        try {
          const { data: products } = await supabaseAdmin
            .from("products")
            .select("slug, updated_at")
            .eq("active", true);
          (products ?? []).forEach((p: { slug: string; updated_at: string | null }) => {
            entries.push(
              urlEntry(`${SITE}/products/${p.slug}`, p.updated_at ?? undefined, "weekly", 0.8),
            );
          });
        } catch {
          // ignore
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>`;

        return new Response(xml, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      },
    },
  },
});

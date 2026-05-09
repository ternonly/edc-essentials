import { useContentBlock } from "@/lib/site-content";

type Article = { tag: string; title: string; excerpt: string; image_url?: string };

const DEFAULTS = {
  kicker: "Field Guide",
  title: "Read Before You Carry",
  subtitle: "Short guides. No filler. Written by people who actually use the tools.",
  articles: [
    { tag: "3 min read", title: "Why Pliers Beat a Swiss Army Knife for Everyday Use", excerpt: "Most multi-tools give you a bit of everything. Pliers give you the one thing you actually need: grip." },
    { tag: "2 min read", title: "How to Read a Wrench Size (And Why Most People Get It Wrong)", excerpt: "Metric vs. imperial, open-end vs. adjustable. A quick guide so you stop guessing." },
    { tag: "4 min read", title: "What Makes a Good Axe Head (And What to Ignore)", excerpt: "Weight, edge geometry, handle angle. The details that separate a useful axe from a decoration." },
  ] as Article[],
  cta_text: "Explore all Field Guide articles →",
  cta_href: "/blogs/field-guide",
};

export function Edu() {
  const c = useContentBlock("home", "edu", DEFAULTS);
  return (
    <section className="s72-edu">
      <div className="s72-section-head">
        <span className="s72-kicker">{c.kicker}</span>
        <h2>{c.title}</h2>
        <p>{c.subtitle}</p>
      </div>
      <div className="s72-edu__grid">
        {c.articles.map((a, i) => (
          <article className="s72-edu-card" key={i}>
            {a.image_url && (
              <img
                src={a.image_url}
                alt=""
                style={{ width: "100%", aspectRatio: "16/10", objectFit: "cover", borderRadius: 6, marginBottom: 14 }}
              />
            )}
            <span className="s72-edu-card__tag">{a.tag}</span>
            <h3>{a.title}</h3>
            <p>{a.excerpt}</p>
            <a href={c.cta_href}>Read the guide →</a>
          </article>
        ))}
      </div>
      <div className="s72-edu__cta">
        <a href={c.cta_href}>{c.cta_text}</a>
      </div>
    </section>
  );
}

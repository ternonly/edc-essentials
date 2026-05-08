const ARTICLES = [
  {
    tag: "3 min read",
    title: "Why Pliers Beat a Swiss Army Knife for Everyday Use",
    excerpt:
      "Most multi-tools give you a bit of everything. Pliers give you the one thing you actually need: grip.",
  },
  {
    tag: "2 min read",
    title: "How to Read a Wrench Size (And Why Most People Get It Wrong)",
    excerpt:
      "Metric vs. imperial, open-end vs. adjustable. A quick guide so you stop guessing.",
  },
  {
    tag: "4 min read",
    title: "What Makes a Good Axe Head (And What to Ignore)",
    excerpt:
      "Weight, edge geometry, handle angle. The details that separate a useful axe from a decoration.",
  },
];

export function Edu() {
  return (
    <section className="s72-edu">
      <div className="s72-section-head">
        <span className="s72-kicker">Field Guide</span>
        <h2>Read Before You Carry</h2>
        <p>Short guides. No filler. Written by people who actually use the tools.</p>
      </div>
      <div className="s72-edu__grid">
        {ARTICLES.map((a) => (
          <article className="s72-edu-card" key={a.title}>
            <span className="s72-edu-card__tag">{a.tag}</span>
            <h3>{a.title}</h3>
            <p>{a.excerpt}</p>
            <a href="/blogs/field-guide">Read the guide →</a>
          </article>
        ))}
      </div>
      <div className="s72-edu__cta">
        <a href="/blogs/field-guide">Explore all Field Guide articles →</a>
      </div>
    </section>
  );
}

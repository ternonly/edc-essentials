import { useContentBlock } from "@/lib/site-content";

const DEFAULTS = {
  kicker: "Why it matters",
  title: "Why carry three separate tools\nwhen one decision covers everything?",
  body: "Most people have a wrench in the garage,\na knife in a drawer, and *nothing in their bag.*\n\nThat gap between home and wherever you actually are\nis exactly what Survival72 fills.",
};

function renderInlineEm(text: string) {
  // very small parser: *text* -> <em>
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((p, i) =>
    p.startsWith("*") && p.endsWith("*") ? <em key={i}>{p.slice(1, -1)}</em> : p,
  );
}

function multiline(text: string) {
  return text.split("\n").map((line, i, arr) => (
    <span key={i}>
      {renderInlineEm(line)}
      {i < arr.length - 1 && <br />}
    </span>
  ));
}

export function Problem() {
  const c = useContentBlock("home", "problem", DEFAULTS);
  return (
    <section className="s72-problem">
      <p className="s72-problem__kicker">{c.kicker}</p>
      <h2 className="s72-problem__title">{multiline(c.title)}</h2>
      <p className="s72-problem__body">{multiline(c.body)}</p>
    </section>
  );
}

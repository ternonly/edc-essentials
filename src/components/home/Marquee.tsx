import { useContentBlock } from "@/lib/site-content";

const DEFAULTS = {
  items: [
    "3 Tools · 1 System",
    "Ships Within 48h",
    "2-Year Guarantee",
    "Gift-Ready Packaging",
    "Free Shipping Over $100",
  ] as string[],
};

export function Marquee() {
  const c = useContentBlock("home", "marquee", DEFAULTS);
  const loop = [...c.items, ...c.items];
  return (
    <section className="s72-marquee" aria-label="Trust badges">
      <div className="s72-marquee__track">
        {loop.map((t, i) => (
          <span key={i}>
            {t}
            <span className="s72-marquee__dot"> · </span>
          </span>
        ))}
      </div>
    </section>
  );
}

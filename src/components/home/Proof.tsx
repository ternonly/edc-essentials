import { Link } from "@tanstack/react-router";
import { useContentBlock } from "@/lib/site-content";

type Stat = { num: string; label: string };
type Review = { name: string; loc: string; text: string };

const DEFAULTS = {
  kicker: "Social Proof",
  title: "Used Daily. Recommended Often.",
  stats: [
    { num: "2,300+", label: "Kits Delivered" },
    { num: "4.9", label: "Average Rating" },
    { num: "48h", label: "Ships Within" },
    { num: "2yr", label: "Guarantee" },
  ] as Stat[],
  reviews: [
    { name: "Khaled R.", loc: "Dubai, UAE", text: "I have carried the wrench module every day for three months. It has replaced two tools in my bag and earned its place. No flashy claims — just works." },
    { name: "Priya M.", loc: "Abu Dhabi, UAE", text: "Bought the full kit as a gift for my father. The packaging felt like an heirloom box. He actually uses every piece — that is the highest compliment." },
    { name: "James T.", loc: "Expatriate, Riyadh", text: "Not flashy. Just does what it promises. The axe lives in my truck and the pliers live in my pocket. That is the entire review." },
  ] as Review[],
};

export function Proof() {
  const c = useContentBlock("home", "proof", DEFAULTS);
  return (
    <section className="s72-proof">
      <div className="s72-proof__inner">
        <div className="s72-section-head">
          <span className="s72-kicker">{c.kicker}</span>
          <h2>{c.title}</h2>
        </div>

        <div className="s72-proof__stats">
          {c.stats.map((s, i) => (
            <div className="s72-stat" key={i}>
              <div className="s72-stat__num">{s.num}</div>
              <div className="s72-stat__label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="s72-reviews">
          {c.reviews.map((r, i) => (
            <article className="s72-review-card" key={i}>
              <div className="s72-review-card__stars">★★★★★</div>
              <p>"{r.text}"</p>
              <div className="s72-review-card__author">{r.name}</div>
              <div className="s72-review-card__loc">{r.loc}</div>
            </article>
          ))}
        </div>

        <div className="s72-proof__cta">
          <Link to="/shop-the-kit" search={{ auto_kit: "elite" }} className="s72-btn s72-btn--gold">
            Build My Kit →
          </Link>
        </div>
      </div>
    </section>
  );
}

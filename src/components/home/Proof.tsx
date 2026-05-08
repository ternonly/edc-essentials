import { Link } from "@tanstack/react-router";

const STATS = [
  { num: "2,300+", label: "Kits Delivered" },
  { num: "4.9", label: "Average Rating" },
  { num: "48h", label: "Ships Within" },
  { num: "2yr", label: "Guarantee" },
];

const REVIEWS = [
  {
    name: "Khaled R.",
    loc: "Dubai, UAE",
    text: "I have carried the wrench module every day for three months. It has replaced two tools in my bag and earned its place. No flashy claims — just works.",
  },
  {
    name: "Priya M.",
    loc: "Abu Dhabi, UAE",
    text: "Bought the full kit as a gift for my father. The packaging felt like an heirloom box. He actually uses every piece — that is the highest compliment.",
  },
  {
    name: "James T.",
    loc: "Expatriate, Riyadh",
    text: "Not flashy. Just does what it promises. The axe lives in my truck and the pliers live in my pocket. That is the entire review.",
  },
];

export function Proof() {
  return (
    <section className="s72-proof">
      <div className="s72-proof__inner">
        <div className="s72-section-head">
          <span className="s72-kicker">Social Proof</span>
          <h2>Used Daily. Recommended Often.</h2>
        </div>

        <div className="s72-proof__stats">
          {STATS.map((s) => (
            <div className="s72-stat" key={s.label}>
              <div className="s72-stat__num">{s.num}</div>
              <div className="s72-stat__label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="s72-reviews">
          {REVIEWS.map((r) => (
            <article className="s72-review-card" key={r.name}>
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

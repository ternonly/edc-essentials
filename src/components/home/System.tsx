import { Link } from "@tanstack/react-router";
import giftBox from "@/assets/gift-box.jpg";

const CARDS = [
  {
    icon: "🔧",
    module: "Module 01",
    title: "Precision Pliers",
    body: "7.2-inch cold-forged steel. High-torque grip with integrated wire cutter and survival notch.",
  },
  {
    icon: "🔩",
    module: "Module 02",
    title: "Roadside Wrench",
    body: "Optimized for vehicle battery terminals and plumbing valves. Universal fit for emergency mechanics.",
  },
  {
    icon: "🪓",
    module: "Module 03",
    title: "Breacher Axe",
    body: "Short-handle emergency axe with 45-degree bevel. Engineered for entry, recovery, and heavy prep.",
  },
];

export function System() {
  return (
    <section className="s72-system">
      <div className="s72-section-head">
        <span className="s72-kicker">The System</span>
        <h2>Three Modules. One System.</h2>
        <p>Buy what you need. Add as you grow. Built to work alone — engineered to work together.</p>
      </div>

      <div className="s72-grid">
        {CARDS.map((c) => (
          <article className="s72-card" key={c.title}>
            <span className="s72-card__icon" aria-hidden>{c.icon}</span>
            <div className="s72-card__module">{c.module}</div>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
          </article>
        ))}
      </div>

      <div className="s72-gift-integration">
        <img src={giftBox} alt="Elite magnetic gift box" loading="lazy" width={1024} height={1024} />
        <div>
          <span className="s72-tag">The Ultimate Gift</span>
          <h3>The Unboxing Experience</h3>
          <p>
            Premium packaging engineered to feel as decisive as the tools inside. A gift that holds
            its weight — literally and figuratively.
          </p>
          <ul className="s72-checklist">
            <li><b>Premium Packaging:</b> 2mm weighted gray-board box with a hidden magnetic closure.</li>
            <li><b>Protection:</b> Custom-cut high-density EVA foam lined with black suede.</li>
            <li><b>Education:</b> Includes the physical 24-page Survival72™ Field Guide.</li>
          </ul>
          <Link to="/shop-the-kit" search={{ auto_kit: "elite" }} className="s72-btn">
            Configure Your Elite Gift Set
          </Link>
        </div>
      </div>

      <div className="s72-system__cta">
        <Link to="/shop-the-kit" search={{ auto_kit: "elite" }} className="s72-btn">
          Configure Your Elite Gift Set
        </Link>
        <Link to="/shop-the-kit" className="s72-btn s72-btn--outline">Shop the Kit</Link>
      </div>
    </section>
  );
}

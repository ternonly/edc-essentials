import { Link } from "@tanstack/react-router";
import giftBox from "@/assets/gift-box.jpg";
import pliersImg from "@/assets/product-pliers-cutout.png";
import wrenchImg from "@/assets/product-wrench-cutout.png";
import axeImg from "@/assets/product-axe-cutout.png";
import { useContentBlock } from "@/lib/site-content";

type Card = { icon?: string; image_url?: string; module: string; title: string; body: string };

const DEFAULTS = {
  kicker: "The System",
  title: "Three Modules. One System.",
  subtitle: "Buy what you need. Add as you grow. Built to work alone — engineered to work together.",
    cards: [
      { image_url: pliersImg, module: "Module 01", title: "Precision Pliers", body: "7.2-inch cold-forged steel. High-torque grip with integrated wire cutter and survival notch." },
      { image_url: wrenchImg, module: "Module 02", title: "Roadside Wrench", body: "Optimized for vehicle battery terminals and plumbing valves. Universal fit for emergency mechanics." },
      { image_url: axeImg, module: "Module 03", title: "Breacher Axe", body: "Short-handle emergency axe with 45-degree bevel. Engineered for entry, recovery, and heavy prep." },
    ] as Card[],
  gift_image_url: "",
  gift_tag: "The Ultimate Gift",
  gift_title: "The Unboxing Experience",
  gift_body: "Premium packaging engineered to feel as decisive as the tools inside. A gift that holds its weight — literally and figuratively.",
  gift_bullets: [
    "**Premium Packaging:** 2mm weighted gray-board box with a hidden magnetic closure.",
    "**Protection:** Custom-cut high-density EVA foam lined with black suede.",
    "**Education:** Includes the physical 24-page Survival72™ Field Guide.",
  ] as string[],
};

function bold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <b key={i}>{p.slice(2, -2)}</b> : p,
  );
}

export function System() {
  const c = useContentBlock("home", "system", DEFAULTS);
  const giftImg = c.gift_image_url || giftBox;
  return (
    <section className="s72-system">
      <div className="s72-section-head">
        <span className="s72-kicker">{c.kicker}</span>
        <h2>{c.title}</h2>
        <p>{c.subtitle}</p>
      </div>

      <div className="s72-grid">
        {c.cards.map((card, i) => (
          <article className="s72-card" key={i}>
            {card.image_url ? (
              <img
                src={card.image_url}
                alt={card.title}
                loading="lazy"
                style={{ width: "100%", height: 200, objectFit: "contain", marginBottom: 16, display: "block" }}
              />
            ) : (
              <span className="s72-card__icon" aria-hidden>{card.icon}</span>
            )}
            <div className="s72-card__module">{card.module}</div>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </article>
        ))}
      </div>

      <div className="s72-gift-integration">
        <img src={giftImg} alt="Gift box" loading="lazy" width={1024} height={1024} />
        <div>
          <span className="s72-tag">{c.gift_tag}</span>
          <h3>{c.gift_title}</h3>
          <p>{c.gift_body}</p>
          <ul className="s72-checklist">
            {c.gift_bullets.map((b, i) => (
              <li key={i}>{bold(b)}</li>
            ))}
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

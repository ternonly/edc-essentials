import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import giftBoxImg from "@/assets/gift-box.jpg";
import { MediaSlots } from "@/components/MediaSlots";
import { supabase } from "@/integrations/supabase/client";
import { canonicalTags } from "@/lib/seo";

export const Route = createFileRoute("/products/gift-box")({
  head: () => {
    const c = canonicalTags("/products/gift-box");
    return {
      meta: [
        { title: "Elite Magnetic Gift Box — Survival72™" },
        { name: "description", content: "Premium clamshell gift packaging engineered for the Survival72 modular kit. Hidden magnetic clasp, EVA + suede interior." },
        { property: "og:title", content: "Elite Magnetic Gift Box — Survival72™" },
        { property: "og:description", content: "2mm gray-board, hidden magnetic clasp, EVA + suede interior. + $29." },
        { property: "og:image", content: giftBoxImg },
        { name: "twitter:image", content: giftBoxImg },
        ...c.meta,
      ],
      links: c.links,
    };
  },
  component: GiftBoxPage,
});

const SPECS: [string, string][] = [
  ["Material", "2mm gray board + magnetic closure"],
  ["Interior", "High-density EVA foam, black suede lining"],
  ["Dimensions", "18 × 14 × 4 cm"],
  ["Weight", "~185 g (optimized for shipping)"],
  ["Contents", "3 tool slots + Field Guide slot + tool card slot"],
  ["Finish", "Matte black exterior, gold foil S72 logo"],
  ["Closure", "Hidden magnetic clasp"],
  ["Includes", "Gift box, EVA inlay, 24-page Field Guide"],
];

function GiftBoxPage() {
  const [hero, setHero] = useState<string>(giftBoxImg);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    supabase
      .from("product_assets")
      .select("url")
      .eq("product_id", "gift-box")
      .eq("slot", "1")
      .maybeSingle()
      .then(({ data }) => { if (data?.url) setHero(data.url); });
  }, []);

  return (
    <div className="gift-page">
      <div className="gift-page__hero">
        <button
          type="button"
          className="gift-hero-img"
          onClick={() => setLightbox(true)}
          aria-label="Zoom image"
        >
          <img src={hero} alt="Elite Magnetic Gift Box — clamshell case with EVA foam inlays" fetchPriority="high" />
          <span className="preview-box__zoom" aria-hidden>⤢</span>
        </button>

        <div className="gift-page__info">
          <span className="s72-tag">The Ultimate Gift</span>
          <h1>Elite Magnetic Gift Box</h1>
          <div className="gift-page__price">$29</div>
          <p className="gift-page__lede">
            A presentation-grade clamshell case for the full Survival72™ modular kit. Holds the weight of
            the tools — and the moment.
          </p>
          <ul className="s72-checklist">
            <li><b>Premium packaging:</b> 2mm weighted gray-board with hidden magnetic closure.</li>
            <li><b>Protection:</b> Custom-cut high-density EVA foam lined with black suede.</li>
            <li><b>Education:</b> Includes the physical 24-page Survival72™ Field Guide.</li>
          </ul>
          <a href="/shop-the-kit?auto_kit=elite" className="s72-btn">Configure Elite Gift Set</a>
        </div>
      </div>

      <section className="gift-page__section">
        <MediaSlots productId="gift-box" />
      </section>

      <section className="gift-page__section">
        <h3 className="media-slots__title">Specifications</h3>
        <table className="specs-table">
          <tbody>
            {SPECS.map(([k, v]) => (
              <tr key={k}><th>{k}</th><td>{v}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      {lightbox && (
        <div className="lb-overlay open" onClick={() => setLightbox(false)} role="dialog" aria-modal="true">
          <img src={hero} alt="Gift box zoom" />
          <button className="lb-close" onClick={() => setLightbox(false)} aria-label="Close">✕</button>
        </div>
      )}
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import hero from "@/assets/hero-banner.jpg";
import { useContentBlock } from "@/lib/site-content";

const DEFAULTS = {
  title_line1: "BUILT FOR THE",
  title_line2: "72 HOURS THAT MATTER",
  subtitle: "Professional-grade modular tools. Carry confidence, not clutter.",
  cta: "Shop the Kit",
  cta_to: "/shop-the-kit",
  image_url: "",
};

export function Hero() {
  const c = useContentBlock("home", "hero", DEFAULTS);
  const bg = c.image_url || hero;
  return (
    <section className="s72-hero" style={{ backgroundImage: `url(${bg})` }}>
      <div className="s72-hero__overlay">
        <div className="s72-hero__content">
          <h1>
            {c.title_line1}
            <br />
            {c.title_line2}
          </h1>
          <p>{c.subtitle}</p>
          <Link to={c.cta_to as any} className="s72-btn">{c.cta}</Link>
        </div>
      </div>
    </section>
  );
}

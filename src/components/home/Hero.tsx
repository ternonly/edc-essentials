import { Link } from "@tanstack/react-router";
import hero from "@/assets/hero-banner.jpg";

export function Hero() {
  return (
    <section className="s72-hero" style={{ backgroundImage: `url(${hero})` }}>
      <div className="s72-hero__overlay">
        <div className="s72-hero__content">
          <h1>BUILT FOR THE<br />72 HOURS THAT MATTER</h1>
          <p>Professional-grade modular tools. Carry confidence, not clutter.</p>
          <Link to="/shop-the-kit" className="s72-btn">Shop the Kit</Link>
        </div>
      </div>
    </section>
  );
}

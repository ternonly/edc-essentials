import { Link } from "@tanstack/react-router";
import { useContentBlock } from "@/lib/site-content";

const DEFAULTS = {
  brand: "SURVIVAL72",
  about: "Built for the 72 hours that matter. Professional-grade modular tools engineered for everyday carry and emergency readiness.",
  copyright: "© 2024 Survival72™. All rights reserved.",
  region: "GCC · COD · AED",
};

export function SiteFooter() {
  const c = useContentBlock("site", "footer", DEFAULTS);
  return (
    <footer className="s72-footer">
      <div className="s72-footer__inner">
        <div>
          <h4 style={{ letterSpacing: "3px" }}>{c.brand}</h4>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "#999", maxWidth: 320 }}>{c.about}</p>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            <li><Link to="/shop-the-kit">Shop the Kit</Link></li>
            <li><Link to="/shop-the-kit" search={{ auto_kit: "elite" }}>Elite Gift Set</Link></li>
            <li><Link to="/products/gift-box">Gift Box</Link></li>
            <li><Link to="/wholesale">B2B & Procurement</Link></li>
            <li><Link to="/military-discount">Military Discount</Link></li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/our-promise">Our Promise</Link></li>
            <li><Link to="/corporate-partnerships">Corporate</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/track">Track Order</Link></li>
          </ul>
        </div>
        <div>
          <h4>Support</h4>
          <ul>
            <li><Link to="/return-policy">Returns</Link></li>
            <li><Link to="/shipping-policy">Shipping</Link></li>
            <li><Link to="/warranty">Warranty</Link></li>
            <li><Link to="/cancellation-policy">Cancellation</Link></li>
            <li><Link to="/privacy-policy">Privacy</Link></li>
            <li><Link to="/terms-of-service">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="s72-footer__bottom">
        <span>{c.copyright}</span>
        <span>{c.region}</span>
      </div>
    </footer>
  );
}

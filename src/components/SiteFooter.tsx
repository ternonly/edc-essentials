import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="s72-footer">
      <div className="s72-footer__inner">
        <div>
          <h4 style={{ letterSpacing: "3px" }}>SURVIVAL72</h4>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "#999", maxWidth: 320 }}>
            Built for the 72 hours that matter. Professional-grade modular tools
            engineered for everyday carry and emergency readiness.
          </p>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            <li><Link to="/shop-the-kit">Shop the Kit</Link></li>
            <li><Link to="/shop-the-kit" search={{ auto_kit: "elite" }}>Elite Gift Set</Link></li>
            <li><Link to="/wholesale">Wholesale</Link></li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/our-promise">Our Promise</Link></li>
            <li><Link to="/corporate-partnerships">Corporate</Link></li>
          </ul>
        </div>
        <div>
          <h4>Support</h4>
          <ul>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/return-policy">Return Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="s72-footer__bottom">
        <span>© 2024 Survival72™. All rights reserved.</span>
        <span>GCC · COD · AED</span>
      </div>
    </footer>
  );
}

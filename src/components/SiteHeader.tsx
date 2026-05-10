import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";

function LangToggle() {
  const { i18n } = useTranslation();
  const next = i18n.language?.startsWith("ar") ? "en" : "ar";
  return (
    <button
      type="button"
      className="s72-lang"
      onClick={() => i18n.changeLanguage(next)}
      aria-label="Toggle language"
    >
      {next === "ar" ? "ع" : "EN"}
    </button>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const { isAdmin } = useAuth();

  return (
    <header className="s72-header">
      <div className="s72-header__inner">
        <Link to="/" className="s72-logo" onClick={close}>SURVIVAL72</Link>
        <nav className="s72-nav">
          <Link to="/shop-the-kit">Shop the Kit</Link>
          <Link to="/about">About</Link>
          <Link to="/wholesale">B2B</Link>
          <Link to="/contact">Contact</Link>
          {isAdmin && <Link to="/admin">Admin</Link>}
        </nav>
        <LangToggle />
        <Link to="/shop-the-kit" className="s72-cart">
          <span className="s72-cart-text">Cart</span>
          <span className="s72-cart__badge">0</span>
        </Link>
        <button
          aria-label="Open menu"
          className="s72-hamburger"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <><path d="M4 7h16M4 12h16M4 17h16" /></>}
          </svg>
        </button>
      </div>
      {open && (
        <div className="s72-mobile-drawer">
          <Link to="/shop-the-kit" onClick={close}>Shop the Kit</Link>
          <Link to="/about" onClick={close}>About</Link>
          <Link to="/wholesale" onClick={close}>B2B</Link>
          <Link to="/contact" onClick={close}>Contact</Link>
          {isAdmin && <Link to="/admin" onClick={close}>Admin</Link>}
        </div>
      )}
    </header>
  );
}

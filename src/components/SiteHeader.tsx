import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";

function useCartCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const read = () => {
      try {
        const raw = JSON.parse(localStorage.getItem("s72_cart") || "[]");
        setCount(Array.isArray(raw) ? raw.length : 0);
      } catch {
        setCount(0);
      }
    };
    read();
    const onChange = () => read();
    window.addEventListener("storage", onChange);
    window.addEventListener("s72-cart-changed", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("s72-cart-changed", onChange);
    };
  }, []);
  return count;
}

const LANG_CYCLE: Record<string, string> = { en: "ar", ar: "zh", zh: "en" };
const LANG_LABEL: Record<string, string> = { en: "EN", ar: "ع", zh: "中" };

function LangToggle() {
  const { i18n } = useTranslation();
  const cur = (i18n.language || "en").slice(0, 2);
  const next = LANG_CYCLE[cur] ?? "ar";
  return (
    <button
      type="button"
      className="s72-lang"
      onClick={() => i18n.changeLanguage(next)}
      aria-label={`Switch to ${next.toUpperCase()}`}
      title={`→ ${LANG_LABEL[next]}`}
    >
      {LANG_LABEL[cur] ?? "EN"}
    </button>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const { isAdmin, user } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="s72-header">
      <div className="s72-header__inner">
        <Link to="/" className="s72-logo" onClick={close}>SURVIVAL72</Link>
        <nav className="s72-nav">
          <Link to="/shop-the-kit">{t("nav.shop")}</Link>
          <Link to="/about">{t("nav.about")}</Link>
          <Link to="/blog">{t("nav.blog")}</Link>
          <Link to="/wholesale">{t("nav.b2b")}</Link>
          <Link to="/contact">{t("nav.contact")}</Link>
          <Link to="/track">{t("nav.track")}</Link>
          {user ? <Link to="/account">{t("nav.account")}</Link> : <Link to="/login">{t("nav.signin")}</Link>}
          {isAdmin && <Link to="/admin">{t("nav.admin")}</Link>}
        </nav>
        <LangToggle />
        <Link to="/shop-the-kit" className="s72-cart">
          <span className="s72-cart-text">{t("nav.cart")}</span>
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
          <Link to="/shop-the-kit" onClick={close}>{t("nav.shop")}</Link>
          <Link to="/about" onClick={close}>{t("nav.about")}</Link>
          <Link to="/blog" onClick={close}>{t("nav.blog")}</Link>
          <Link to="/wholesale" onClick={close}>{t("nav.b2b")}</Link>
          <Link to="/contact" onClick={close}>{t("nav.contact")}</Link>
          <Link to="/track" onClick={close}>{t("nav.track")}</Link>
          {user ? <Link to="/account" onClick={close}>{t("nav.account")}</Link> : <Link to="/login" onClick={close}>{t("nav.signin")}</Link>}
          {isAdmin && <Link to="/admin" onClick={close}>{t("nav.admin")}</Link>}
        </div>
      )}
    </header>
  );
}

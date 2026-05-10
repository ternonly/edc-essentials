import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import pliersImg from "@/assets/pliers.jpg";
import wrenchImg from "@/assets/wrench.jpg";
import axeImg from "@/assets/axe.jpg";
import giftBoxImg from "@/assets/gift-box.jpg";
import { supabase } from "@/integrations/supabase/client";
import { MediaSlots } from "@/components/MediaSlots";

export const Route = createFileRoute("/shop-the-kit")({
  validateSearch: z.object({ auto_kit: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Shop the Kit — Survival72™" },
      {
        name: "description",
        content:
          "Configure your Survival72 kit. Pick the modules you need, add the gift box, and check out.",
      },
      { property: "og:title", content: "Shop the Kit — Survival72™" },
      { property: "og:description", content: "Build your modular EDC kit." },
    ],
  }),
  component: ShopTheKit,
});

type ToolId = "pliers" | "wrench" | "axe";

const PRICES: Record<ToolId, number> = { pliers: 52, wrench: 42, axe: 49 };
const BOX_PRICE = 29;

type ProductRow = {
  id: ToolId;
  module: string;
  name: string;
  image: string;
  price: number;
  specs: [string, string][];
};

const DEFAULT_PRODUCTS: ProductRow[] = [
  {
    id: "pliers",
    module: "Module 01 — Pliers",
    name: "Precision Multi-Pliers",
    image: pliersImg,
    price: 52,
    specs: [
      ["Model", "PA-92A"],
      ["Functions", "25-in-1"],
      ["Material", "420 Stainless Steel"],
      ["Folded Length", "10.5 cm"],
      ["Weight", "180 g"],
      ["Jaw Opening", "25 mm"],
      ["Blade", "Serrated + Straight"],
      ["Finish", "Sandblasted + Black Oxide"],
      ["Includes", "Nylon Sheath, S72 Card"],
    ],
  },
  {
    id: "wrench",
    module: "Module 02 — Wrench",
    name: "Roadside Wrench",
    image: wrenchImg,
    price: 42,
    specs: [
      ["Model", "KA-62A"],
      ["Bits", "9 (PH1, PH2, SL4, SL6, H3, H4, H5, T25, T30)"],
      ["Material", "CR-V Drop-Forged Steel"],
      ["Folded Length", "12 cm"],
      ["Weight", "145 g"],
      ["Drive", "1/4\" (6.35 mm)"],
      ["Ratchet", "Reversible"],
      ["Finish", "Satin Chrome"],
      ["Includes", "Bit Pouch, S72 Card"],
    ],
  },
  {
    id: "axe",
    module: "Module 03 — Axe",
    name: "Desert Breacher Axe",
    image: axeImg,
    price: 49,
    specs: [
      ["Model", "XI-G8"],
      ["Functions", "8-in-1"],
      ["Head Material", "3CR13 Stainless Steel"],
      ["Handle", "G10 Composite"],
      ["Overall Length", "24 cm"],
      ["Head Weight", "180 g"],
      ["Total Weight", "320 g"],
      ["Edge", "25° Bevel, Field-Sharpenable"],
      ["Includes", "Ballistic Nylon Sheath, S72 Card"],
    ],
  },
];

// (P-W-A-B) -> { id, price }
const VARIANTS: Record<string, { id: string; price: number }> = {
  "1-0-0-0": { id: "44902746980397", price: 52 },
  "0-1-0-0": { id: "44902747078701", price: 42 },
  "0-0-1-0": { id: "44902740820013", price: 49 },
  "1-1-0-0": { id: "44902746882093", price: 79 },
  "0-1-1-0": { id: "44902747111469", price: 76 },
  "1-0-1-0": { id: "44902747013165", price: 86 },
  "1-1-1-0": { id: "44902746914861", price: 116 },
  "1-1-1-1": { id: "44902746947629", price: 145 },
};

function ShopTheKit() {
  const search = Route.useSearch();
  const [mode, setMode] = useState<"build" | "elite">("build");
  const [products, setProducts] = useState<ProductRow[]>(DEFAULT_PRODUCTS);
  const [selected, setSelected] = useState<Record<ToolId, boolean>>({
    pliers: false,
    wrench: false,
    axe: false,
  });
  const [box, setBox] = useState(false);
  const [preview, setPreview] = useState<ToolId | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<ToolId | "gift" | null>(null);
  const [cartState, setCartState] = useState<"idle" | "adding" | "added">("idle");
  const cartTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Overlay DB-managed product fields (image / name / price / specs) by slug.
  useEffect(() => {
    supabase
      .from("products")
      .select("slug,module_label,name,price,image_url,specs")
      .in("slug", ["pliers", "wrench", "axe"])
      .then(({ data }) => {
        if (!data) return;
        setProducts((prev) =>
          prev.map((p) => {
            const row = data.find((r) => r.slug === p.id);
            if (!row) return p;
            const usable = row.image_url && /^https?:\/\//.test(row.image_url);
            return {
              ...p,
              module: row.module_label ?? p.module,
              name: row.name ?? p.name,
              price: row.price != null ? Number(row.price) : p.price,
              image: usable ? row.image_url! : p.image,
              specs: Array.isArray(row.specs) && row.specs.length ? (row.specs as any) : p.specs,
            };
          }),
        );
      });
  }, []);

  // ?auto_kit=elite — auto-select all + box
  useEffect(() => {
    if (search.auto_kit === "elite") {
      setMode("elite");
      setSelected({ pliers: true, wrench: true, axe: true });
      setBox(true);
    }
  }, [search.auto_kit]);

  const allThree = selected.pliers && selected.wrench && selected.axe;

  // If all 3 deselected at any point, lock + uncheck the gift box
  useEffect(() => {
    if (!allThree && box) setBox(false);
  }, [allThree, box]);

  const selectedCount = Object.values(selected).filter(Boolean).length;

  const { subtotal, discount, total, save } = useMemo(() => {
    const sub =
      (selected.pliers ? PRICES.pliers : 0) +
      (selected.wrench ? PRICES.wrench : 0) +
      (selected.axe ? PRICES.axe : 0);
    let disc = 0;
    if (selectedCount === 2) disc = 15;
    if (selectedCount === 3) disc = 27;
    const boxAdd = box ? BOX_PRICE : 0;
    return {
      subtotal: sub,
      discount: disc,
      total: sub - disc + boxAdd,
      save: disc,
    };
  }, [selected, box, selectedCount]);

  const variantKey = `${selected.pliers ? 1 : 0}-${selected.wrench ? 1 : 0}-${selected.axe ? 1 : 0}-${box ? 1 : 0}`;
  const variant = VARIANTS[variantKey];

  function toggle(id: ToolId) {
    setMode("build");
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  function pickElite() {
    setMode("elite");
    setSelected({ pliers: true, wrench: true, axe: true });
    setBox(true);
  }

  function pickBuild() {
    setMode("build");
  }

  function buildLineItems() {
    if (!variant) return [];
    const lines: { name: string; variantId: string; price: number; key: string; ts: number }[] = [];
    const ts = Date.now();
    // Push one entry per selected module so checkout shows real product names
    products.forEach((p) => {
      if (selected[p.id]) {
        lines.push({ name: `${p.module} — ${p.name}`, variantId: p.id, price: p.price, key: p.id, ts });
      }
    });
    if (box) {
      lines.push({ name: "Elite Magnetic Gift Box", variantId: "gift-box", price: BOX_PRICE, key: "gift-box", ts });
    }
    // Apply combo discount as a negative line so total matches the configurator price
    if (discount > 0) {
      lines.push({ name: `Bundle discount (${selectedCount} modules)`, variantId: "discount", price: -discount, key: "discount", ts });
    }
    return lines;
  }

  function writeCart() {
    const lines = buildLineItems();
    if (!lines.length) return;
    try {
      const cart = JSON.parse(localStorage.getItem("s72_cart") ?? "[]");
      cart.push(...lines);
      localStorage.setItem("s72_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("s72-cart-changed"));
    } catch {
      /* noop */
    }
  }

  async function addToCart() {
    if (!variant || cartState !== "idle") return;
    setCartState("adding");
    try {
      await fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ id: variant.id, quantity: 1 }] }),
      }).catch(() => null);
    } finally {
      writeCart();
      setCartState("added");
      // Reset selection so user can build another sub-kit and add again
      setSelected({ pliers: false, wrench: false, axe: false });
      setBox(false);
      if (cartTimer.current) clearTimeout(cartTimer.current);
      cartTimer.current = setTimeout(() => setCartState("idle"), 2000);
    }
  }

  function buyNow() {
    if (!variant) return;
    writeCart();
    window.location.href = "/checkout.html";
  }

  // ESC closes drawer / lightbox
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (lightbox) setLightbox(null);
      else if (drawer) setDrawer(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, drawer]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (drawer || lightbox) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [drawer, lightbox]);

  const previewProduct = preview ? products.find((p) => p.id === preview) : null;
  const drawerProduct = drawer && drawer !== "gift" ? products.find((p) => p.id === drawer) : null;

  const ctaLabel =
    cartState === "adding"
      ? "Adding…"
      : cartState === "added"
        ? "✓ Added to Cart"
        : selectedCount === 0
          ? "Select a Module"
          : `Add to Cart — $${total.toFixed(2)}`;

  return (
    <div className="kit-page">
      <div className="kit-head">
        <h1>Survival72™ Modular System</h1>
        <p>Build your kit. Every tool engineered for 72-hour deployment.</p>
      </div>

      <div className="mode-row">
        <button
          className={`mode-btn ${mode === "build" ? "active" : ""}`}
          onClick={pickBuild}
          type="button"
        >
          Build Your Kit
        </button>
        <button
          className={`mode-btn elite ${mode === "elite" ? "active" : ""}`}
          onClick={pickElite}
          type="button"
        >
          Elite Gift Set — $145
        </button>
      </div>

      <div className="kit-layout">
        {/* Preview */}
        <div className="preview-wrap">
          <div
            className="preview-box"
            onClick={() => previewProduct && setLightbox(previewProduct.image)}
            role="button"
            tabIndex={0}
            aria-label="Zoom product image"
          >
            {!previewProduct && (
              <span className="preview-box__hint">Hover a product to preview</span>
            )}
            {products.map((p) => (
              <img
                key={p.id}
                src={p.image}
                alt={p.name}
                className={preview === p.id ? "show" : ""}
                loading="lazy"
              />
            ))}
            <div className="preview-box__zoom" aria-hidden>⤢</div>
          </div>
        </div>

        {/* Cards + price */}
        <div>
          <div className="kit-cards">
            {products.map((p) => (
              <div
                key={p.id}
                className={`kit-card ${selected[p.id] ? "selected" : ""}`}
                onMouseEnter={() => setPreview(p.id)}
                onClick={() => toggle(p.id)}
              >
                <div className="kit-card__check" aria-hidden>✓</div>
                <div className="kit-card__thumb">
                  <img src={p.image} alt={p.name} loading="lazy" />
                </div>
                <div>
                  <div className="kit-card__module">{p.module}</div>
                  <div className="kit-card__name">{p.name}</div>
                  <div className="kit-card__row">
                    <span className="kit-card__price">${p.price}</span>
                    <button
                      type="button"
                      className="kit-card__details"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDrawer(p.id);
                      }}
                    >
                      View Details ›
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Gift box */}
            <div
              className={`gift-row ${!allThree ? "locked" : ""} ${box ? "selected" : ""}`}
              onClick={() => allThree && setBox((v) => !v)}
            >
              <div className="gift-row__thumb">
                <img src={giftBoxImg} alt="Elite gift box" loading="lazy" />
              </div>
              <div>
                <div className="gift-row__title">
                  Elite Magnetic Gift Box
                  <small>Premium clamshell case · EVA foam inlays · S72 Field Guide</small>
                </div>
                <button
                  type="button"
                  className="kit-card__details"
                  onClick={(e) => { e.stopPropagation(); setDrawer("gift"); }}
                >
                  View Details ›
                </button>
              </div>
              <div className="gift-row__price">+ ${BOX_PRICE}</div>
              {!allThree && (
                <div className="gift-row__lock-overlay">
                  Select all 3 modules to unlock
                </div>
              )}
            </div>
          </div>

          {/* Price bar */}
          <div className="price-bar">
            <div className="price-bar__top">
              <span>Kit Total</span>
              {save > 0 && <span className="price-bar__save">You save ${save}</span>}
            </div>
            <div className="price-bar__total">${total.toFixed(2)}</div>
            {selectedCount === 0 && (
              <div className="price-bar__hint">Pick a module to start your kit.</div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <button
              className="add-cart-btn"
              disabled={selectedCount === 0 || cartState !== "idle"}
              onClick={addToCart}
              type="button"
            >
              {ctaLabel}
            </button>
            <button
              className="add-cart-btn"
              style={{ background: "#c9a96e", color: "#fff" }}
              disabled={selectedCount === 0}
              onClick={buyNow}
              type="button"
            >
              {selectedCount === 0 ? "Select a Module" : `Buy Now — $${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <div
        className={`lb-overlay ${lightbox ? "open" : ""}`}
        onClick={() => setLightbox(null)}
        role="dialog"
        aria-modal="true"
      >
        {lightbox && <img src={lightbox} alt="Zoomed product" />}
        <button
          type="button"
          className="lb-close"
          onClick={(e) => {
            e.stopPropagation();
            setLightbox(null);
          }}
          aria-label="Close zoom"
        >
          ✕
        </button>
      </div>

      {/* Drawer */}
      <div
        className={`drawer-overlay ${drawer ? "open" : ""}`}
        onClick={() => setDrawer(null)}
      />
      <aside className={`drawer ${drawer ? "open" : ""}`} aria-hidden={!drawer}>
        {drawerProduct && (
          <>
            <div className="drawer__head">
              <div>
                <small>{drawerProduct.module}</small>
                <h3>{drawerProduct.name}</h3>
              </div>
              <button className="drawer__close" onClick={() => setDrawer(null)} aria-label="Close" type="button">✕</button>
            </div>
            <div className="drawer__body">
              <MediaSlots productId={drawerProduct.id} />
              <div className="drawer__section-title" style={{ marginTop: 28 }}>Specifications</div>
              <table className="specs-table">
                <tbody>
                  {drawerProduct.specs.map(([k, v]: [string, string]) => (
                    <tr key={k}><th>{k}</th><td>{v}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {drawer === "gift" && (
          <>
            <div className="drawer__head">
              <div>
                <small>The Ultimate Gift</small>
                <h3>Elite Magnetic Gift Box</h3>
              </div>
              <button className="drawer__close" onClick={() => setDrawer(null)} aria-label="Close" type="button">✕</button>
            </div>
            <div className="drawer__body">
              <MediaSlots productId="gift-box" />
              <div className="drawer__section-title" style={{ marginTop: 28 }}>Specifications</div>
              <table className="specs-table">
                <tbody>
                  <tr><th>Material</th><td>2mm gray board + magnetic closure</td></tr>
                  <tr><th>Interior</th><td>High-density EVA foam, black suede lining</td></tr>
                  <tr><th>Dimensions</th><td>18 × 14 × 4 cm</td></tr>
                  <tr><th>Weight</th><td>~185 g</td></tr>
                  <tr><th>Closure</th><td>Hidden magnetic clasp</td></tr>
                  <tr><th>Includes</th><td>Gift box, EVA inlay, 24-page Field Guide</td></tr>
                </tbody>
              </table>
              <div style={{ marginTop: 24, textAlign: "center" }}>
                <a href="/products/gift-box" className="s72-btn s72-btn--outline">Open standalone page →</a>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

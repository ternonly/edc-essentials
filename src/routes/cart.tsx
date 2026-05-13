import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

type CartItem = {
  name?: string;
  variantId?: string;
  price: number;
  key?: string;
  ts?: number;
  qty?: number;
};

type GroupedItem = {
  key: string;
  name: string;
  price: number; // unit price
  qty: number;
  isDiscount: boolean;
  indices: number[]; // indices in raw cart for legacy un-quantified items
};

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Survival72™" },
      { name: "description", content: "Review your selected modules and proceed to checkout." },
    ],
  }),
  component: CartPage,
});

const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING = 20;
const PROMO_CODES: Record<string, { off: number; label: string }> = {
  SAVE10: { off: 0.1, label: "10% OFF" },
  WELCOME15: { off: 0.15, label: "15% OFF" },
};

function readCart(): CartItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem("s72_cart") || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem("s72_cart", JSON.stringify(items));
  window.dispatchEvent(new Event("s72-cart-changed"));
}

function groupCart(items: CartItem[]): GroupedItem[] {
  const map = new Map<string, GroupedItem>();
  items.forEach((it, idx) => {
    const name = it.name || it.variantId || "Item";
    const price = Number(it.price) || 0;
    const isDiscount = price < 0;
    const key = `${name}__${price}`;
    const existing = map.get(key);
    const addQty = Math.max(1, Number(it.qty) || 1);
    if (existing) {
      existing.qty += addQty;
      existing.indices.push(idx);
    } else {
      map.set(key, {
        key,
        name,
        price,
        qty: addQty,
        isDiscount,
        indices: [idx],
      });
    }
  });
  return Array.from(map.values());
}

function expandGroups(groups: GroupedItem[]): CartItem[] {
  // store as 1 row per group with qty
  return groups.map((g) => ({
    name: g.name,
    price: g.price,
    qty: g.qty,
    key: g.name,
    ts: Date.now(),
  }));
}

function CartPage() {
  const [groups, setGroups] = useState<GroupedItem[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);
  const [promo, setPromo] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; off: number; label: string } | null>(null);
  const [promoError, setPromoError] = useState("");

  useEffect(() => {
    const list = readCart();
    const g = groupCart(list);
    setGroups(g);
    const initSel: Record<string, boolean> = {};
    g.forEach((it) => (initSel[it.key] = true));
    setSelected(initSel);
    setHydrated(true);
  }, []);

  const allSelected = groups.length > 0 && groups.every((g) => selected[g.key]);
  const selectedGroups = groups.filter((g) => selected[g.key]);
  const subtotal = selectedGroups.reduce((s, g) => s + g.price * g.qty, 0);
  const discount = appliedPromo && subtotal > 0 ? subtotal * appliedPromo.off : 0;
  const subtotalAfterDiscount = Math.max(0, subtotal - discount);
  const shipping = subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD || subtotalAfterDiscount === 0 ? 0 : FLAT_SHIPPING;
  const total = subtotalAfterDiscount + shipping;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotalAfterDiscount);
  const progress = Math.min(100, (subtotalAfterDiscount / FREE_SHIPPING_THRESHOLD) * 100);

  const persist = (next: GroupedItem[]) => {
    setGroups(next);
    writeCart(expandGroups(next));
  };

  function toggle(k: string) {
    setSelected((s) => ({ ...s, [k]: !s[k] }));
  }
  function toggleAll() {
    const next: Record<string, boolean> = {};
    const v = !allSelected;
    groups.forEach((g) => (next[g.key] = v));
    setSelected(next);
  }
  function changeQty(k: string, delta: number) {
    const next = groups
      .map((g) => (g.key === k ? { ...g, qty: g.qty + delta } : g))
      .filter((g) => g.qty > 0);
    persist(next);
    if (!next.find((g) => g.key === k)) {
      setSelected((s) => {
        const c = { ...s };
        delete c[k];
        return c;
      });
    }
  }
  function removeItem(k: string) {
    const next = groups.filter((g) => g.key !== k);
    persist(next);
    setSelected((s) => {
      const c = { ...s };
      delete c[k];
      return c;
    });
  }
  function clearAll() {
    setGroups([]);
    setSelected({});
    writeCart([]);
  }
  function applyPromo() {
    const code = promo.trim().toUpperCase();
    if (!code) return;
    const found = PROMO_CODES[code];
    if (found) {
      setAppliedPromo({ code, ...found });
      setPromoError("");
    } else {
      setAppliedPromo(null);
      setPromoError("Invalid code");
    }
  }
  function removePromo() {
    setAppliedPromo(null);
    setPromo("");
    setPromoError("");
  }
  function checkout() {
    if (selectedGroups.length === 0) return;
    // Expand selected groups into individual line items for checkout compatibility
    const out: CartItem[] = [];
    selectedGroups.forEach((g) => {
      for (let i = 0; i < g.qty; i++) {
        out.push({ name: g.name, price: g.price, key: g.name, ts: Date.now() });
      }
    });
    if (appliedPromo && subtotal > 0) {
      out.push({
        name: `Promo: ${appliedPromo.code} (${appliedPromo.label})`,
        price: -discount,
        key: `promo_${appliedPromo.code}`,
        ts: Date.now(),
      });
    }
    writeCart(out);
    window.location.href = "/checkout.html";
  }

  function avatarFor(name: string) {
    const ch = (name || "?").trim().charAt(0).toUpperCase();
    return ch || "?";
  }

  return (
    <>
      <style>{cartCss}</style>
      <div className="s72-cart-page">
        <div className="s72-cart-page__head">
          <div>
            <div className="s72-cart-page__crumb">
              <Link to="/">Home</Link> / <Link to="/shop-the-kit">Shop</Link> / <span>Cart</span>
            </div>
            <h1 className="s72-cart-page__title">YOUR CART</h1>
          </div>
          <Link to="/shop-the-kit" className="s72-btn s72-btn--outline s72-cart-page__back">
            ← Continue Shopping
          </Link>
        </div>

        {!hydrated ? null : groups.length === 0 ? (
          <div className="s72-cart-empty">
            <div className="s72-cart-empty__icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add a module to start building your 72-hour kit.</p>
            <Link to="/shop-the-kit" className="s72-btn s72-btn--primary">
              Browse Products
            </Link>
            <div className="s72-cart-empty__suggest">
              <span>Popular:</span>
              <Link to="/shop-the-kit">Survival Kit</Link>
              <Link to="/products/gift-box">Gift Box</Link>
              <Link to="/wholesale">Wholesale</Link>
            </div>
          </div>
        ) : (
          <div className="s72-cart-grid">
            {/* LEFT: items */}
            <div className="s72-cart-main">
              {/* Free shipping progress */}
              <div className="s72-ship-bar">
                <div className="s72-ship-bar__text">
                  {subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD ? (
                    <strong>✓ You've unlocked FREE shipping!</strong>
                  ) : (
                    <>
                      Add <strong>${remaining.toFixed(2)}</strong> more for{" "}
                      <strong>FREE shipping</strong>
                    </>
                  )}
                </div>
                <div className="s72-ship-bar__track">
                  <div
                    className="s72-ship-bar__fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="s72-ship-bar__scale">
                  <span>$0</span>
                  <span>${FREE_SHIPPING_THRESHOLD} 🚚</span>
                </div>
              </div>

              <div className="s72-cart-list">
                <div className="s72-cart-list__head">
                  <label className="s72-check">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                    <span>Select all ({groups.length})</span>
                  </label>
                  <button onClick={clearAll} type="button" className="s72-cart-clear">
                    Clear cart
                  </button>
                </div>

                {groups.map((g) => (
                  <div key={g.key} className="s72-cart-row">
                    <input
                      type="checkbox"
                      className="s72-cart-row__check"
                      checked={!!selected[g.key]}
                      onChange={() => toggle(g.key)}
                    />
                    <div className={`s72-cart-row__avatar ${g.isDiscount ? "is-discount" : ""}`}>
                      {g.isDiscount ? "%" : avatarFor(g.name)}
                    </div>
                    <div className="s72-cart-row__info">
                      <div className={`s72-cart-row__name ${g.isDiscount ? "is-discount" : ""}`}>
                        {g.name}
                      </div>
                      <div className="s72-cart-row__unit">
                        {g.isDiscount ? "−" : ""}${Math.abs(g.price).toFixed(2)} each
                      </div>
                    </div>
                    {!g.isDiscount ? (
                      <div className="s72-qty">
                        <button type="button" onClick={() => changeQty(g.key, -1)} aria-label="Decrease">
                          −
                        </button>
                        <span>{g.qty}</span>
                        <button type="button" onClick={() => changeQty(g.key, 1)} aria-label="Increase">
                          +
                        </button>
                      </div>
                    ) : (
                      <div className="s72-cart-row__qty-static">×{g.qty}</div>
                    )}
                    <div className={`s72-cart-row__total ${g.isDiscount ? "is-discount" : ""}`}>
                      {g.isDiscount ? "−" : ""}${Math.abs(g.price * g.qty).toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeItem(g.key)}
                      type="button"
                      aria-label="Remove"
                      className="s72-cart-row__del"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="s72-trust">
                <div><span>🔒</span> Secure checkout</div>
                <div><span>↩</span> 7-day returns</div>
                <div><span>🛡️</span> Quality guarantee</div>
                <div><span>💬</span> 24/7 support</div>
              </div>
            </div>

            {/* RIGHT: summary */}
            <aside className="s72-cart-summary">
              <h3>Order Summary</h3>

              <div className="s72-promo">
                {appliedPromo ? (
                  <div className="s72-promo__applied">
                    <span>
                      ✓ <strong>{appliedPromo.code}</strong> ({appliedPromo.label})
                    </span>
                    <button type="button" onClick={removePromo}>Remove</button>
                  </div>
                ) : (
                  <>
                    <div className="s72-promo__row">
                      <input
                        type="text"
                        placeholder="Promo code"
                        value={promo}
                        onChange={(e) => setPromo(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                      />
                      <button type="button" onClick={applyPromo}>Apply</button>
                    </div>
                    {promoError && <div className="s72-promo__err">{promoError}</div>}
                    <div className="s72-promo__hint">Try SAVE10 or WELCOME15</div>
                  </>
                )}
              </div>

              <div className="s72-sum-row">
                <span>Subtotal ({selectedGroups.reduce((s, g) => s + g.qty, 0)} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="s72-sum-row is-discount">
                  <span>Discount</span>
                  <span>−${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="s72-sum-row">
                <span>Shipping</span>
                <span className={shipping === 0 && subtotalAfterDiscount > 0 ? "is-free" : ""}>
                  {subtotalAfterDiscount === 0 ? "—" : shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="s72-sum-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button
                type="button"
                onClick={checkout}
                disabled={selectedGroups.length === 0}
                className="s72-checkout-btn"
              >
                CHECKOUT — ${total.toFixed(2)}
              </button>
              <Link to="/shop-the-kit" className="s72-btn s72-btn--outline s72-summary-back">
                ← Back to Shop
              </Link>

              <div className="s72-pay-icons" aria-label="Accepted payment methods">
                <span>VISA</span>
                <span>MC</span>
                <span>AMEX</span>
                <span>PayPal</span>
                <span>Apple Pay</span>
              </div>
              <p className="s72-summary-note">
                Only selected items will be sent to checkout. Taxes calculated at checkout.
              </p>
            </aside>
          </div>
        )}
      </div>

      {/* Mobile sticky bar */}
      {hydrated && groups.length > 0 && (
        <div className="s72-sticky-bar">
          <div>
            <div className="s72-sticky-bar__label">Total</div>
            <div className="s72-sticky-bar__total">${total.toFixed(2)}</div>
          </div>
          <button
            type="button"
            onClick={checkout}
            disabled={selectedGroups.length === 0}
            className="s72-checkout-btn"
          >
            CHECKOUT
          </button>
        </div>
      )}
    </>
  );
}

const cartCss = `
.s72-cart-page { max-width: 1200px; margin: 32px auto 120px; padding: 0 20px; }
.s72-cart-page__head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.s72-cart-page__crumb { font-size: 12px; color: #888; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
.s72-cart-page__crumb a { color: #888; text-decoration: none; }
.s72-cart-page__crumb a:hover { color: #1a1a1a; }
.s72-cart-page__title { font-size: 32px; font-weight: 800; letter-spacing: 2px; margin: 0; }
.s72-cart-page__back { padding: 10px 18px; }

.s72-cart-empty { background: #fff; border: 1px solid #e8e8e8; border-radius: 12px; padding: 64px 24px; text-align: center; }
.s72-cart-empty__icon { font-size: 56px; margin-bottom: 12px; }
.s72-cart-empty h2 { font-size: 20px; margin: 0 0 8px; }
.s72-cart-empty p { color: #666; margin: 0 0 24px; }
.s72-cart-empty__suggest { margin-top: 28px; display: flex; justify-content: center; gap: 14px; flex-wrap: wrap; font-size: 13px; color: #888; align-items: center; }
.s72-cart-empty__suggest a { color: #1a1a1a; text-decoration: underline; text-decoration-color: #c9a96e; text-underline-offset: 4px; }

.s72-cart-grid { display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: start; }

.s72-ship-bar { background: linear-gradient(135deg, #fffbf3, #fff); border: 1px solid #f0e6d2; border-radius: 12px; padding: 16px 18px; margin-bottom: 16px; }
.s72-ship-bar__text { font-size: 14px; color: #1a1a1a; margin-bottom: 10px; }
.s72-ship-bar__text strong { color: #c9a96e; }
.s72-ship-bar__track { height: 8px; background: #f0e6d2; border-radius: 999px; overflow: hidden; }
.s72-ship-bar__fill { height: 100%; background: linear-gradient(90deg, #c9a96e, #d4b87a); border-radius: 999px; transition: width 0.4s ease; }
.s72-ship-bar__scale { display: flex; justify-content: space-between; margin-top: 6px; font-size: 11px; color: #999; }

.s72-cart-list { background: #fff; border: 1px solid #e8e8e8; border-radius: 12px; overflow: hidden; }
.s72-cart-list__head { display: flex; align-items: center; padding: 14px 20px; border-bottom: 1px solid #f0f0f0; background: #fafafa; }
.s72-check { display: inline-flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; }
.s72-check input { width: 18px; height: 18px; cursor: pointer; accent-color: #1a1a1a; }
.s72-cart-clear { margin-left: auto; background: none; border: none; color: #c0392b; font-size: 13px; cursor: pointer; text-decoration: underline; }

.s72-cart-row { display: grid; grid-template-columns: 24px 56px 1fr auto auto 32px; align-items: center; gap: 14px; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; }
.s72-cart-row:last-child { border-bottom: none; }
.s72-cart-row__check { width: 18px; height: 18px; cursor: pointer; accent-color: #1a1a1a; }
.s72-cart-row__avatar { width: 56px; height: 56px; border-radius: 8px; background: linear-gradient(135deg, #1a1a1a, #2a2a2a); color: #c9a96e; display: grid; place-items: center; font-weight: 800; font-size: 22px; letter-spacing: 1px; }
.s72-cart-row__avatar.is-discount { background: linear-gradient(135deg, #27ae60, #2ecc71); color: #fff; }
.s72-cart-row__info { min-width: 0; }
.s72-cart-row__name { font-weight: 600; color: #1a1a1a; overflow: hidden; text-overflow: ellipsis; }
.s72-cart-row__name.is-discount { color: #27ae60; }
.s72-cart-row__unit { font-size: 12px; color: #999; margin-top: 2px; }
.s72-cart-row__total { font-weight: 700; min-width: 70px; text-align: right; color: #1a1a1a; }
.s72-cart-row__total.is-discount { color: #27ae60; }
.s72-cart-row__del { background: none; border: none; color: #999; font-size: 18px; cursor: pointer; padding: 4px; transition: color 0.15s; }
.s72-cart-row__del:hover { color: #c0392b; }
.s72-cart-row__qty-static { font-size: 13px; color: #888; min-width: 40px; text-align: center; }

.s72-qty { display: inline-flex; align-items: center; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; }
.s72-qty button { width: 30px; height: 30px; border: none; background: #fafafa; cursor: pointer; font-size: 16px; font-weight: 600; color: #1a1a1a; transition: background 0.15s; }
.s72-qty button:hover { background: #1a1a1a; color: #c9a96e; }
.s72-qty span { min-width: 36px; text-align: center; font-weight: 600; font-size: 14px; }

.s72-trust { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 16px; padding: 16px; background: #fafafa; border-radius: 8px; font-size: 12px; color: #666; }
.s72-trust > div { display: flex; align-items: center; gap: 6px; }
.s72-trust span { font-size: 16px; }

.s72-cart-summary { background: #fff; border: 1px solid #e8e8e8; border-radius: 12px; padding: 24px; position: sticky; top: 20px; }
.s72-cart-summary h3 { font-size: 14px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 16px; padding-bottom: 14px; border-bottom: 2px solid #1a1a1a; }

.s72-promo { margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px dashed #e8e8e8; }
.s72-promo__row { display: flex; gap: 8px; }
.s72-promo__row input { flex: 1; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 13px; outline: none; }
.s72-promo__row input:focus { border-color: #1a1a1a; }
.s72-promo__row button { padding: 0 16px; background: #1a1a1a; color: #fff; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; letter-spacing: 1px; cursor: pointer; text-transform: uppercase; }
.s72-promo__row button:hover { background: #c9a96e; }
.s72-promo__hint { font-size: 11px; color: #aaa; margin-top: 6px; }
.s72-promo__err { font-size: 12px; color: #c0392b; margin-top: 6px; }
.s72-promo__applied { display: flex; justify-content: space-between; align-items: center; background: #e8f8f0; border: 1px solid #b8e6cc; padding: 10px 12px; border-radius: 6px; font-size: 13px; color: #27ae60; }
.s72-promo__applied button { background: none; border: none; color: #c0392b; cursor: pointer; font-size: 12px; text-decoration: underline; }

.s72-sum-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
.s72-sum-row.is-discount { color: #27ae60; font-weight: 600; }
.s72-sum-row .is-free { color: #27ae60; font-weight: 700; }
.s72-sum-total { display: flex; justify-content: space-between; padding: 14px 0 0; margin-top: 8px; border-top: 2px solid #1a1a1a; font-size: 18px; font-weight: 800; }

.s72-checkout-btn { display: block; width: 100%; padding: 16px; margin-top: 18px; background: #1a1a1a; color: #fff; border: 2px solid #1a1a1a; border-radius: 8px; font-weight: 800; font-size: 14px; letter-spacing: 2px; cursor: pointer; transition: all 0.15s; }
.s72-checkout-btn:hover:not(:disabled) { background: #c9a96e; border-color: #c9a96e; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(201, 169, 110, 0.3); }
.s72-checkout-btn:disabled { background: #ccc; border-color: #ccc; cursor: not-allowed; }

.s72-summary-back { display: block; text-align: center; margin-top: 10px; padding: 12px; }

.s72-pay-icons { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 16px; justify-content: center; }
.s72-pay-icons span { font-size: 10px; font-weight: 700; padding: 4px 8px; background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 4px; color: #666; letter-spacing: 0.5px; }

.s72-summary-note { font-size: 11px; color: #999; margin: 12px 0 0; text-align: center; line-height: 1.5; }

.s72-sticky-bar { display: none; }

@media (max-width: 900px) {
  .s72-cart-grid { grid-template-columns: 1fr; }
  .s72-cart-summary { position: static; }
}

@media (max-width: 640px) {
  .s72-cart-page { padding: 0 14px; margin: 20px auto 100px; }
  .s72-cart-page__title { font-size: 24px; }
  .s72-cart-page__back { display: none; }
  .s72-cart-row { grid-template-columns: 20px 44px 1fr 28px; gap: 10px; padding: 14px; row-gap: 10px; }
  .s72-cart-row__avatar { width: 44px; height: 44px; font-size: 18px; }
  .s72-cart-row__info { grid-column: 3 / 4; }
  .s72-cart-row__del { grid-column: 4 / 5; align-self: start; }
  .s72-qty { grid-column: 2 / 4; }
  .s72-cart-row__qty-static { grid-column: 2 / 4; text-align: left; }
  .s72-cart-row__total { grid-column: 4 / 5; align-self: end; min-width: auto; font-size: 15px; }
  .s72-trust { grid-template-columns: repeat(2, 1fr); }
  .s72-cart-list__head { padding: 12px 14px; }

  .s72-sticky-bar {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 50;
    background: #fff; border-top: 1px solid #e8e8e8;
    padding: 12px 16px; box-shadow: 0 -4px 16px rgba(0,0,0,0.08);
  }
  .s72-sticky-bar__label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
  .s72-sticky-bar__total { font-size: 20px; font-weight: 800; }
  .s72-sticky-bar .s72-checkout-btn { width: auto; margin: 0; padding: 14px 24px; }
}
`;

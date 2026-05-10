import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type CartItem = {
  name?: string;
  variantId?: string;
  price: number;
  key?: string;
  ts?: number;
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

function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const list = readCart();
    setItems(list);
    const initSel: Record<number, boolean> = {};
    list.forEach((_, i) => (initSel[i] = true));
    setSelected(initSel);
    setHydrated(true);
  }, []);

  const allSelected = items.length > 0 && items.every((_, i) => selected[i]);
  const selectedItems = items.filter((_, i) => selected[i]);
  const subtotal = selectedItems.reduce((s, it) => s + (Number(it.price) || 0), 0);
  const shipping = subtotal >= 100 ? 0 : 20;
  const total = subtotal + shipping;
  const remaining = Math.max(0, 100 - subtotal);

  function toggle(i: number) {
    setSelected((s) => ({ ...s, [i]: !s[i] }));
  }
  function toggleAll() {
    const next: Record<number, boolean> = {};
    const v = !allSelected;
    items.forEach((_, i) => (next[i] = v));
    setSelected(next);
  }
  function removeItem(i: number) {
    const next = items.filter((_, idx) => idx !== i);
    setItems(next);
    writeCart(next);
    const sel: Record<number, boolean> = {};
    next.forEach((_, idx) => (sel[idx] = true));
    setSelected(sel);
  }
  function clearAll() {
    setItems([]);
    setSelected({});
    writeCart([]);
  }
  function checkout() {
    if (selectedItems.length === 0) return;
    writeCart(selectedItems);
    window.location.href = "/checkout.html";
  }

  return (
    <div style={{ maxWidth: 920, margin: "40px auto", padding: "0 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: 1 }}>YOUR CART</h1>
        <Link to="/shop-the-kit" className="s72-btn s72-btn--outline" style={{ padding: "10px 18px" }}>
          ← Continue Shopping
        </Link>
      </div>

      {!hydrated ? null : items.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 8, padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Your cart is empty</h2>
          <p style={{ color: "#666", marginBottom: 24 }}>Add a module to start your kit.</p>
          <Link to="/shop-the-kit" className="s72-btn" style={{ padding: "12px 24px" }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #f0f0f0", background: "#fafafa", gap: 12 }}>
              <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ width: 18, height: 18, cursor: "pointer" }} />
              <span style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                Select all ({items.length})
              </span>
              <button onClick={clearAll} type="button" style={{ marginLeft: "auto", background: "none", border: "none", color: "#c0392b", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
                Clear cart
              </button>
            </div>

            {items.map((it, i) => {
              const isDiscount = (Number(it.price) || 0) < 0;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f0f0f0", gap: 14 }}>
                  <input type="checkbox" checked={!!selected[i]} onChange={() => toggle(i)} style={{ width: 18, height: 18, cursor: "pointer" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: isDiscount ? "#27ae60" : "#1a1a1a" }}>
                      {it.name || it.variantId || "Item"}
                    </div>
                    {it.key && it.key !== it.name && (
                      <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{it.key}</div>
                    )}
                  </div>
                  <div style={{ fontWeight: 700, minWidth: 80, textAlign: "right", color: isDiscount ? "#27ae60" : "#1a1a1a" }}>
                    {isDiscount ? "−" : ""}${Math.abs(Number(it.price) || 0).toFixed(2)}
                  </div>
                  <button onClick={() => removeItem(i)} type="button" aria-label="Remove" style={{ background: "none", border: "none", color: "#999", fontSize: 18, cursor: "pointer", padding: 4 }}>
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 8, padding: 24, marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span>Subtotal ({selectedItems.length} selected)</span>
              <span style={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span>Shipping</span>
              <span style={{ fontWeight: 600, color: shipping === 0 ? "#27ae60" : undefined }}>
                {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div style={{
              fontSize: 13,
              color: subtotal >= 100 ? "#27ae60" : "#666",
              padding: "10px 12px",
              background: subtotal >= 100 ? "#e8f8f0" : "#f9f8f6",
              borderRadius: 6,
              margin: "10px 0 14px",
            }}>
              {subtotal >= 100
                ? "✓ You've unlocked FREE shipping"
                : `Add $${remaining.toFixed(2)} more for FREE shipping (otherwise $20).`}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0", borderTop: "2px solid #1a1a1a", fontSize: 18, fontWeight: 700 }}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
              <Link to="/shop-the-kit" className="s72-btn s72-btn--outline" style={{ padding: "14px", textAlign: "center" }}>
                ← Back to Shop
              </Link>
              <button
                type="button"
                onClick={checkout}
                disabled={selectedItems.length === 0}
                className="s72-btn"
                style={{
                  padding: "14px",
                  background: selectedItems.length === 0 ? "#ccc" : "#1a1a1a",
                  color: "#fff",
                  border: "none",
                  cursor: selectedItems.length === 0 ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  letterSpacing: 1,
                }}
              >
                CHECKOUT — ${total.toFixed(2)}
              </button>
            </div>
            <p style={{ fontSize: 12, color: "#999", marginTop: 10, textAlign: "center" }}>
              Only selected items will be sent to checkout.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

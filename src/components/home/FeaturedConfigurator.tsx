import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import pliersImg from "@/assets/product-pliers-cutout.png";
import wrenchImg from "@/assets/product-wrench-cutout.png";
import axeImg from "@/assets/product-axe-cutout.png";

type Id = "pliers" | "wrench" | "axe";
const PRICES: Record<Id, number> = { pliers: 52, wrench: 42, axe: 49 };
const BOX = 29;
const PRODUCTS: { id: Id; module: string; name: string; img: string; price: number }[] = [
  { id: "pliers", module: "Module 01", name: "Precision Pliers", img: pliersImg, price: 52 },
  { id: "wrench", module: "Module 02", name: "Roadside Wrench", img: wrenchImg, price: 42 },
  { id: "axe", module: "Module 03", name: "Breacher Axe", img: axeImg, price: 49 },
];

export function FeaturedConfigurator() {
  const [sel, setSel] = useState<Record<Id, boolean>>({ pliers: false, wrench: false, axe: false });
  const [box, setBox] = useState(false);
  const [hover, setHover] = useState<Id | null>(null);

  const count = (Object.values(sel) as boolean[]).filter(Boolean).length;
  useEffect(() => { if (count < 3 && box) setBox(false); }, [count, box]);

  const subtotal = (Object.entries(sel) as [Id, boolean][])
    .reduce((s, [k, v]) => s + (v ? PRICES[k] : 0), 0);
  const discount = count === 3 ? 27 : count === 2 ? 15 : 0;
  const total = Math.max(0, subtotal - discount) + (box ? BOX : 0);
  const saved = discount;

  const previewImg = hover ? PRODUCTS.find(p => p.id === hover)!.img : null;

  return (
    <section className="s72-feat-cfg">
      <div className="s72-section-head">
        <span className="s72-kicker">Configure your kit</span>
        <h2>Three Modules. One Decision.</h2>
        <p>Pick the modules that match your day. Discounts unlock as you add.</p>
      </div>

      <div className="s72-feat-cfg__grid">
        <div className="s72-feat-cfg__preview">
          {previewImg ? (
            <img src={previewImg} alt="" />
          ) : (
            <div className="s72-feat-cfg__hint">Hover a module to preview</div>
          )}
        </div>

        <div className="s72-feat-cfg__right">
          {PRODUCTS.map((p) => {
            const active = sel[p.id];
            return (
              <button
                key={p.id}
                type="button"
                className={`s72-feat-card ${active ? "is-active" : ""}`}
                onMouseEnter={() => setHover(p.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setSel({ ...sel, [p.id]: !active })}
              >
                <img src={p.img} alt={p.name} />
                <div>
                  <div className="s72-feat-card__module">{p.module}</div>
                  <div className="s72-feat-card__name">{p.name}</div>
                </div>
                <div className="s72-feat-card__price">${p.price}</div>
                {active && <span className="s72-feat-card__check" aria-hidden>✓</span>}
              </button>
            );
          })}

          <button
            type="button"
            className={`s72-feat-gift ${count < 3 ? "is-locked" : ""} ${box ? "is-active" : ""}`}
            onClick={() => count >= 3 && setBox(!box)}
            aria-disabled={count < 3}
          >
            <div className="s72-feat-gift__thumb">🎁</div>
            <div>
              <div className="s72-feat-card__name">Elite Magnetic Gift Box</div>
              <small>{count < 3 ? "Select all 3 modules to unlock" : "Premium clamshell case · EVA foam · Field Guide"}</small>
            </div>
            <div className="s72-feat-card__price">+ ${BOX}</div>
          </button>

          <div className="s72-feat-bar">
            <div>
              <div className="s72-feat-bar__label">KIT TOTAL</div>
              <div className="s72-feat-bar__total">${total.toFixed(2)}</div>
            </div>
            {saved > 0 && (
              <div className="s72-feat-bar__save">YOU SAVE ${saved}</div>
            )}
          </div>

          <Link
            to="/shop-the-kit"
            search={count === 3 && box ? { auto_kit: "elite" } : {}}
            className={`s72-btn s72-feat-cta ${count === 0 ? "is-disabled" : ""}`}
          >
            {count === 0 ? "Select a Module" : `Open Full Configurator — $${total.toFixed(2)}`}
          </Link>
        </div>
      </div>
    </section>
  );
}

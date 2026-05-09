import { useContentBlock } from "@/lib/site-content";

type Item = { value: string; label: string };

const DEFAULTS = {
  items: [
    { value: "Free Shipping", label: "on orders over $100" },
    { value: "2-Year Guarantee", label: "on every module" },
    { value: "30-Day Returns", label: "no questions asked" },
    { value: "Gift-Ready", label: "magnetic box available" },
  ] as Item[],
};

export function Promise() {
  const c = useContentBlock("home", "promise", DEFAULTS);
  return (
    <section className="s72-promise">
      <div className="s72-promise__inner">
        {c.items.map((i, idx) => (
          <div className="s72-promise__item" key={idx}>
            <b>{i.value}</b>
            <span>{i.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

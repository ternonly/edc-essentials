const ITEMS = [
  { value: "Free Shipping", label: "on orders over $100" },
  { value: "2-Year Guarantee", label: "on every module" },
  { value: "30-Day Returns", label: "no questions asked" },
  { value: "Gift-Ready", label: "magnetic box available" },
];

export function Promise() {
  return (
    <section className="s72-promise">
      <div className="s72-promise__inner">
        {ITEMS.map((i) => (
          <div className="s72-promise__item" key={i.value}>
            <b>{i.value}</b>
            <span>{i.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

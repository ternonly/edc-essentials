import { createFileRoute } from "@tanstack/react-router";
import { DynamicPage } from "@/components/DynamicPage";
import { canonicalTags, faqJsonLd } from "@/lib/seo";

const FAQ = [
  { q: "What does the 2-year guarantee cover?", a: "Manufacturing defects, material failure and functional breakage under intended use." },
  { q: "What is not covered?", a: "Loss or theft, cosmetic wear (scratches, patina), and damage from fire, flood or combat." },
  { q: "How do I file a claim?", a: "Email survival72bob@gmail.com with a photo. A replacement ships within 48 hours, before you return the original." },
  { q: "What if I prefer a discount instead of a replacement?", a: "We can offer 40% off a re-purchase as an alternative — buyer pays shipping." },
];

export const Route = createFileRoute("/warranty")({
  head: () => {
    const c = canonicalTags("/warranty");
    return {
      meta: [
        { title: "Warranty — Survival72™" },
        { name: "description", content: "2-year unconditional guarantee on every Survival72 module. 48h replacement." },
        { property: "og:title", content: "2-Year Unconditional Guarantee" },
        { property: "og:description", content: "If it breaks under normal use within 2 years, we replace it. No warranty card. No debates." },
        ...c.meta,
      ],
      links: c.links,
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(faqJsonLd(FAQ)) },
      ],
    };
  },
  component: () => (
    <div className="policy-page">
      <DynamicPage
        slug="warranty"
        defaults={{
          kicker: "2-Year Guarantee",
          title: "2-Year Unconditional Guarantee",
          intro: "If it breaks under normal use within 2 years, we replace it. No warranty card. No debates.",
          body_md: `
Alternatively: **40% off a re-purchase** (buyer pays shipping).

## Covered
- Manufacturing defects
- Material failure
- Functional breakage under intended use

## Not covered
- Loss or theft
- Cosmetic wear (scratches, patina)
- Fire, flood, or combat damage

## Claim
Email **survival72bob@gmail.com** with a photo. Replacement ships within 48h — *before* you return the original.
          `.trim(),
        }}
      />
    </div>
  ),
});

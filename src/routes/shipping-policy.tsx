import { createFileRoute } from "@tanstack/react-router";
import { DynamicPage } from "@/components/DynamicPage";
import { canonicalTags, faqJsonLd } from "@/lib/seo";

const FAQ = [
  { q: "How fast do you ship?", a: "Orders are processed and shipped within 48 hours. Cut-off is 14:00 GST (Friday 12:00)." },
  { q: "Do you ship across the GCC?", a: "Yes — UAE, Saudi Arabia, Kuwait, Qatar, Oman and Bahrain. We also ship to Europe, North America and Asia-Pacific." },
  { q: "Is shipping tracked?", a: "Every order is tracked and insured end-to-end." },
  { q: "Is cash on delivery available?", a: "COD is available in UAE and Saudi Arabia only." },
  { q: "When is shipping free?", a: "Free shipping kicks in at AED 350 (UAE), AED 500 (Saudi Arabia), $150 (US/Europe) and equivalents in other regions." },
];

export const Route = createFileRoute("/shipping-policy")({
  head: () => {
    const c = canonicalTags("/shipping-policy");
    return {
      meta: [
        { title: "Shipping Policy — Survival72™" },
        { name: "description", content: "48h fulfillment across the GCC. Tracked + insured. COD available in UAE and Saudi Arabia." },
        { property: "og:title", content: "Shipping Policy — 48h Fulfillment" },
        { property: "og:description", content: "Processing within 48h. All orders tracked and insured. COD in UAE and KSA." },
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
        slug="shipping-policy"
        defaults={{
          kicker: "Logistics",
          title: "Shipping Policy — 48h Fulfillment",
          intro: "Processing within 48h. Cut-off 14:00 GST (Fri 12:00). All orders tracked and insured.",
          body_md: `
## Rate table

| Region | Standard | Express | Free over | Time |
|---|---|---|---|---|
| UAE | AED 45 | AED 45 | AED 350 | 8–12 days |
| Saudi Arabia | AED 60 | AED 65 | AED 500 | 8–12 days |
| Kuwait | AED 60 | AED 75 | AED 550 | 8–12 days |
| Qatar | AED 60 | AED 75 | AED 550 | 8–12 days |
| Oman | AED 60 | AED 75 | AED 550 | 8–12 days |
| Bahrain | AED 60 | AED 75 | AED 550 | 8–12 days |
| Europe | €15 | €35 | €150 | 8–12 days |
| North America | $15 | $30 | $150 | 8–12 days |
| Asia-Pacific | $20 | $40 | $200 | 8–12 days |

## COD
Cash on delivery is available in **UAE** and **Saudi Arabia** only.

Questions: survival72bob@gmail.com — reply within 12h.
          `.trim(),
        }}
      />
    </div>
  ),
});

import { createFileRoute } from "@tanstack/react-router";
import { DynamicPage } from "@/components/DynamicPage";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy — Survival72™" },
      { name: "description", content: "48h fulfillment across the GCC. Tracked + insured. COD available in UAE and Saudi Arabia." },
    ],
  }),
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

import { createFileRoute } from "@tanstack/react-router";
import { DynamicPage } from "@/components/DynamicPage";
import { canonicalTags } from "@/lib/seo";

export const Route = createFileRoute("/terms-of-service")({
  head: () => {
    const c = canonicalTags("/terms-of-service");
    return {
      meta: [
        { title: "Terms of Service — Survival72™" },
        { name: "description", content: "Terms governing your purchase and use of Survival72 products." },
        { property: "og:title", content: "Terms of Service" },
        { property: "og:description", content: "Order acceptance, pricing, liability and governing law." },
        ...c.meta,
      ],
      links: c.links,
    };
  },
  component: () => (
    <div className="policy-page">
      <DynamicPage
        slug="terms-of-service"
        defaults={{
          kicker: "Legal",
          title: "Terms of Service",
          intro: "By placing an order on survival72gear.com you accept the terms below.",
          body_md: `
## Order acceptance
All orders are subject to availability and confirmation of the order price. We reserve the right to refuse or cancel any order.

## Pricing
Prices are shown in the currency selected at checkout and may be updated without notice. Promotional discounts cannot be combined.

## Limitation of liability
Survival72™ is not liable for indirect, incidental, or consequential damages arising from product use beyond intended scope.

## Governing law
These terms are governed by the laws of the United Arab Emirates. Disputes are resolved in Dubai courts.

Contact: survival72bob@gmail.com
          `.trim(),
        }}
      />
    </div>
  ),
});

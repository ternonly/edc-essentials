import { createFileRoute } from "@tanstack/react-router";
import { DynamicPage } from "@/components/DynamicPage";
import { canonicalTags } from "@/lib/seo";

export const Route = createFileRoute("/cancellation-policy")({
  head: () => {
    const c = canonicalTags("/cancellation-policy");
    return {
      meta: [
        { title: "Order Cancellation — Survival72™" },
        { name: "description", content: "How and when you can cancel a Survival72 order." },
        { property: "og:title", content: "Order Cancellation" },
        { property: "og:description", content: "Cancellation window and what happens after fulfilment starts." },
        ...c.meta,
      ],
      links: c.links,
    };
  },
  component: () => (
    <div className="policy-page">
      <DynamicPage
        slug="cancellation-policy"
        defaults={{
          kicker: "Cancellations",
          title: "Order Cancellation",
          intro: "Orders are processed immediately after confirmation. Once an order enters fulfilment (~2 hours), it cannot be cancelled.",
          body_md: `
## After shipment
If the order has already left our warehouse, please follow the [standard return process](/return-policy).

Contact: survival72bob@gmail.com — we reply within 12h.
          `.trim(),
        }}
      />
    </div>
  ),
});
